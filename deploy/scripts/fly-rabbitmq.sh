#!/bin/bash
set -e

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source the utilities
source "$SCRIPT_DIR/util/config.sh"

# Load configuration from fly.env
load_config || exit 1

# Default values (will be overridden by fly.env if present)
MQ_APP_NAME="${MQ_APP_NAME:-meal-manager-mq}"
MAIN_APP_NAME="${APP_NAME:-meal-manager}"
ORG="${ORG:-personal}"
REGION="${REGION:-yul}"
VOLUME_SIZE="${MQ_VOLUME_SIZE:-1}"
RABBITMQ_VERSION="${RABBITMQ_VERSION:-3.12-management}"
ACTION="setup"
SHOW_INFO="false"
ATTACH_APP=""

# Help text
function show_help {
  echo "Usage: $0 [options] [command]"
  echo ""
  echo "Commands:"
  echo "  setup               : Create and configure a RabbitMQ server (default)"
  echo "  info                : Show RabbitMQ server information"
  echo "  attach APP_NAME     : Attach RabbitMQ to another Fly.io app"
  echo "  restart             : Restart the RabbitMQ server"
  echo ""
  echo "Options:"
  echo "  -n MQ_NAME         : RabbitMQ app name (default: $MQ_APP_NAME)"
  echo "  -a MAIN_APP_NAME   : Main application name (default: $MAIN_APP_NAME)"
  echo "  -o ORGANIZATION    : Fly.io organization (default: $ORG)"
  echo "  -r REGION          : Primary region (default: $REGION)"
  echo "  -s VOLUME_SIZE     : Volume size in GB (default: $VOLUME_SIZE)"
  echo "  -v VERSION         : RabbitMQ version (default: $RABBITMQ_VERSION)"
  echo ""
  echo "Examples:"
  echo "  $0                  # Setup RabbitMQ with default settings"
  echo "  $0 -n custom-mq -s 2  # Setup RabbitMQ with custom name and 2GB storage"
  echo "  $0 info            # Show RabbitMQ information"
  echo "  $0 attach my-app   # Attach RabbitMQ to 'my-app'"
}

# Parse command line arguments
while getopts "n:a:o:r:s:v:h" opt; do
  case $opt in
    n) MQ_APP_NAME="$OPTARG" ;;
    a) MAIN_APP_NAME="$OPTARG" ;;
    o) ORG="$OPTARG" ;;
    r) REGION="$OPTARG" ;;
    s) VOLUME_SIZE="$OPTARG" ;;
    v) RABBITMQ_VERSION="$OPTARG" ;;
    h) show_help; exit 0 ;;
    \?) log_error "Invalid option -$OPTARG"; exit 1 ;;
  esac
done

# Skip already processed arguments
shift $((OPTIND-1))

# Process command argument
if [ $# -gt 0 ]; then
    case "$1" in
        setup)
            ACTION="setup"
            ;;
        info)
            ACTION="info"
            SHOW_INFO="true"
            ;;
        attach)
            ACTION="attach"
            if [ $# -lt 2 ]; then
                log_error "Missing APP_NAME for attach command."
                show_help
                exit 1
            fi
            ATTACH_APP="$2"
            ;;
        restart)
            ACTION="restart"
            ;;
        help)
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
fi

# Validate prerequisites
validate_prerequisites || exit 1

# Function to create a unique password
function generate_password {
    # Generate a secure random password
    LC_ALL=$(tr -dc 'A-Za-z0-9!@#$%^&*()_+' </dev/urandom | head -c 24)
}

# Function to setup RabbitMQ
function setup_rabbitmq {
    log_header "Setting up RabbitMQ server: ${MQ_APP_NAME}"
    
    # Check if the app already exists
    if flyctl apps list | grep -q "^$MQ_APP_NAME"; then
        log_warning "RabbitMQ app $MQ_APP_NAME already exists."
        
        # Show current RabbitMQ information
        log_info "Current RabbitMQ information:"
        flyctl status --app "$MQ_APP_NAME"
        
        log_warning "To attach this RabbitMQ to your main app, run:"
        log_info "  ./deploy/scripts/fly-rabbitmq.sh attach $MAIN_APP_NAME"
        
        return 0
    fi
    
    # Create RabbitMQ app
    log_step "Creating RabbitMQ app..."
    
    # Generate admin username and password
    RABBITMQ_USER="admin"
    RABBITMQ_PASSWORD=$(generate_password)
    
    # Create a file for fly.toml
    cat > fly.toml.rabbitmq << EOL
app = "$MQ_APP_NAME"
primary_region = "$REGION"

[build]
  image = "rabbitmq:$RABBITMQ_VERSION"

[mounts]
  source = "rabbitmq_data"
  destination = "/var/lib/rabbitmq"

[env]
  RABBITMQ_DEFAULT_USER = "$RABBITMQ_USER"
  RABBITMQ_DEFAULT_PASS = "$RABBITMQ_PASSWORD"

[http_service]
  internal_port = 15672
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

  [http_service.concurrency]
    type = "connections"
    hard_limit = 200
    soft_limit = 150
EOL
    
    # Create the app
    flyctl apps create "$MQ_APP_NAME" --org "$ORG"
    
    if [ $? -ne 0 ]; then
        log_error "Failed to create RabbitMQ app."
        rm fly.toml.rabbitmq
        exit 1
    fi
    
    # Create volume
    log_step "Creating storage volume..."
    flyctl volumes create rabbitmq_data \
        --app "$MQ_APP_NAME" \
        --region "$REGION" \
        --size "$VOLUME_SIZE"
    
    if [ $? -ne 0 ]; then
        log_error "Failed to create storage volume."
        rm fly.toml.rabbitmq
        exit 1
    fi
    
    # Deploy the app with the configuration
    log_step "Deploying RabbitMQ..."
    flyctl deploy --config fly.toml.rabbitmq --app "$MQ_APP_NAME"
    
    if [ $? -ne 0 ]; then
        log_error "Failed to deploy RabbitMQ."
        rm fly.toml.rabbitmq
        exit 1
    fi
    
    # Clean up the temporary file
    rm fly.toml.rabbitmq
    
    # Create secrets for the RabbitMQ server
    log_step "Setting up RabbitMQ credentials..."
    
    # Store the connection details as secrets
    flyctl secrets set \
        RABBITMQ_USER="$RABBITMQ_USER" \
        RABBITMQ_PASSWORD="$RABBITMQ_PASSWORD" \
        --app "$MQ_APP_NAME"
    
    # Attach to main app if it exists
    if flyctl apps list | grep -q "^$MAIN_APP_NAME"; then
        log_step "Attaching RabbitMQ to main app: $MAIN_APP_NAME"
        attach_to_app "$MAIN_APP_NAME"
    else
        log_warning "Main app $MAIN_APP_NAME does not exist yet."
        log_info "After creating your main app, attach RabbitMQ with:"
        log_info "  ./deploy/scripts/fly-rabbitmq.sh attach $MAIN_APP_NAME"
    fi
    
    log_success "RabbitMQ setup complete!"
    log_info "Management UI URL: https://$MQ_APP_NAME.fly.dev/"
    log_info "Username: $RABBITMQ_USER"
    log_info "Password: $RABBITMQ_PASSWORD"
    log_warning "IMPORTANT: Save these credentials securely. The password is generated once and cannot be retrieved later."
    
    # Show the app details
    flyctl status --app "$MQ_APP_NAME"
}

# Function to attach RabbitMQ to an app
function attach_to_app {
    local app_name="$1"
    
    log_step "Attaching RabbitMQ $MQ_APP_NAME to app $app_name..."
    
    # Check if target app exists
    if ! flyctl apps list | grep -q "^$app_name"; then
        log_error "App $app_name does not exist."
        exit 1
    fi
    
    # Check if RabbitMQ app exists
    if ! flyctl apps list | grep -q "^$MQ_APP_NAME"; then
        log_error "RabbitMQ app $MQ_APP_NAME does not exist."
        exit 1
    fi
    
    # Get RabbitMQ app info
    log_step "Getting RabbitMQ connection details..."
    
    # Get the RabbitMQ host
    RABBITMQ_HOST="$MQ_APP_NAME.internal"
    
    # Get credentials from secrets if they exist
    RABBITMQ_USER=$(flyctl secrets get RABBITMQ_USER --app "$MQ_APP_NAME" 2>/dev/null || echo "admin")
    
    # We can't retrieve the password, so we need to check if it exists or prompt for it
    RABBITMQ_PASSWORD=$(flyctl secrets get RABBITMQ_PASSWORD --app "$MQ_APP_NAME" 2>/dev/null || echo "")
    
    if [ -z "$RABBITMQ_PASSWORD" ]; then
        log_warning "Cannot retrieve RabbitMQ password automatically."
        echo -n "Please enter the RabbitMQ password: "
        read -s RABBITMQ_PASSWORD
        echo ""
        
        if [ -z "$RABBITMQ_PASSWORD" ]; then
            log_error "Password cannot be empty."
            exit 1
        fi
    fi
    
    # Set environment variables in the target app
    log_step "Setting RabbitMQ environment variables in $app_name..."
    
    flyctl secrets set \
        SPRING_RABBITMQ_HOST="$RABBITMQ_HOST" \
        SPRING_RABBITMQ_PORT="5672" \
        SPRING_RABBITMQ_USERNAME="$RABBITMQ_USER" \
        SPRING_RABBITMQ_PASSWORD="$RABBITMQ_PASSWORD" \
        RABBITMQ_URL="amqp://$RABBITMQ_USER:$RABBITMQ_PASSWORD@$RABBITMQ_HOST:5672" \
        --app "$app_name"
    
    if [ $? -ne 0 ]; then
        log_error "Failed to set environment variables in target app."
        exit 1
    fi
    
    log_success "RabbitMQ successfully attached to $app_name!"
    log_info "Environment variables have been set in your app."
    log_info "These include: SPRING_RABBITMQ_HOST, SPRING_RABBITMQ_PORT, SPRING_RABBITMQ_USERNAME, SPRING_RABBITMQ_PASSWORD, RABBITMQ_URL"
}

# Function to restart RabbitMQ
function restart_rabbitmq {
    log_header "Restarting RabbitMQ server: ${MQ_APP_NAME}"
    
    # Check if the app exists
    if ! flyctl apps list | grep -q "^$MQ_APP_NAME"; then
        log_error "RabbitMQ app $MQ_APP_NAME does not exist."
        exit 1
    fi
    
    # Restart the app
    flyctl app restart --app "$MQ_APP_NAME"
    
    if [ $? -ne 0 ]; then
        log_error "Failed to restart RabbitMQ."
        exit 1
    fi
    
    log_success "RabbitMQ restarted successfully!"
    
    # Show the app status
    flyctl status --app "$MQ_APP_NAME"
}

# Function to show information
function show_mq_info {
    log_header "RabbitMQ information for $MQ_APP_NAME:"
    
    # Check if the app exists
    if ! flyctl apps list | grep -q "^$MQ_APP_NAME"; then
        log_error "RabbitMQ app $MQ_APP_NAME does not exist."
        exit 1
    fi
    
    # Show app status
    log_info "App status:"
    flyctl status --app "$MQ_APP_NAME"
    
    # Show IP addresses
    log_info "IP addresses:"
    flyctl ips list --app "$MQ_APP_NAME"
    
    # Show volumes
    log_info "Volumes:"
    flyctl volumes list --app "$MQ_APP_NAME"
    
    log_info "Management UI URL: https://$MQ_APP_NAME.fly.dev/"
    log_info "Username: admin (or custom if you changed it)"
    log_warning "Password: (Cannot be displayed for security reasons)"
}

# Execute the requested action
case "$ACTION" in
    setup)
        setup_rabbitmq
        ;;
    info)
        show_mq_info
        ;;
    attach)
        attach_to_app "$ATTACH_APP"
        ;;
    restart)
        restart_rabbitmq
        ;;
esac

exit 0 