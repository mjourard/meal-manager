#!/bin/bash
set -e

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source the utilities
source "$SCRIPT_DIR/util/config.sh"

# Load configuration from fly.env
load_config || exit 1

# Default values (will be overridden by fly.env if present)
APP_NAME="${APP_NAME:-meal-manager}"
REGION="${REGION:-yul}"
ORG="${ORG:-personal}"
MEMORY_MB="${MEMORY_MB:-1024}"
CPU_COUNT="${CPU_COUNT:-1}"

# Path to API directory and fly.toml
API_DIR="$SCRIPT_DIR/../../api"
FLY_TOML="$API_DIR/fly.toml"

# Help text
function show_help {
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -a APP_NAME      : Application name (default: $APP_NAME)"
  echo "  -r REGION        : Primary region (default: $REGION)"
  echo "  -o ORGANIZATION  : Fly.io organization (default: $ORG)"
  echo "  -m MEMORY_MB     : Memory in MB (default: $MEMORY_MB)"
  echo "  -c CPU_COUNT     : CPU count (default: $CPU_COUNT)"
  echo "  -h               : Show this help"
  echo ""
  echo "Examples:"
  echo "  $0 -a custom-app -r sin      # Setup app with custom name in Singapore region"
  echo "  $0 -m 2048 -c 2              # Setup app with 2GB memory and 2 CPUs"
}

# Parse command line arguments
while getopts "a:r:o:m:c:h" opt; do
  case $opt in
    a) APP_NAME="$OPTARG" ;;
    r) REGION="$OPTARG" ;;
    o) ORG="$OPTARG" ;;
    m) MEMORY_MB="$OPTARG" ;;
    c) CPU_COUNT="$OPTARG" ;;
    h) show_help; exit 0 ;;
    \?) log_error "Invalid option -$OPTARG"; exit 1 ;;
  esac
done

# Validate prerequisites
validate_prerequisites || exit 1

log_header "Setting up Fly.io application: $APP_NAME"

# Check if the app already exists
if flyctl apps list | grep -q "^$APP_NAME"; then
    log_info "App $APP_NAME already exists"
    
    # Update existing app's configuration
    log_step "Updating app configuration..."

    log_step "Applying configuration..."
    flyctl deploy --config "$FLY_TOML" --app "$APP_NAME" --detach --remote-only --no-cache
    
    # Set CPU count and memory
    log_step "Setting CPU and memory..."
    flyctl scale vm shared-cpu-"$CPU_COUNT"x --memory "$MEMORY_MB" --app "$APP_NAME"
    
    log_success "App $APP_NAME configuration updated!"
else
    # Create a new app
    log_step "Creating a new Fly.io app: $APP_NAME"
    flyctl apps create "$APP_NAME" --org "$ORG" --region "$REGION"
    
    if [ $? -ne 0 ]; then
        log_error "Failed to create app $APP_NAME"
        exit 1
    fi

    log_step "Applying configuration..."
    flyctl deploy --config "$FLY_TOML" --app "$APP_NAME" --detach --remote-only --no-cache
    
    
    # Set CPU count and memory
    log_step "Setting CPU and memory..."
    flyctl scale vm shared-cpu-"$CPU_COUNT"x --memory "$MEMORY_MB" --app "$APP_NAME"
    
    if [ $? -ne 0 ]; then
        log_warning "Could not set VM resources yet. A deployment might be needed first."
        log_info "Please run the deploy script before scaling: ./deploy/scripts/fly-deploy.sh"
    else
        log_success "CPU and memory settings applied."
    fi
    
    log_success "App $APP_NAME created successfully!"
fi

# Show configuration
log_header "App Configuration"
log_info "App name: $APP_NAME"
log_info "Organization: $ORG"
log_info "Primary region: $REGION"
log_info "CPU allocation: shared-cpu-${CPU_COUNT}x"
log_info "Memory allocation: ${MEMORY_MB}MB"

log_separator
log_info "Next steps:"
log_info "1. Deploy your application: ./deploy/scripts/fly-deploy.sh"
log_info "2. Set up secrets: ./deploy/scripts/fly-secrets.sh"
log_info "3. Attach services like PostgreSQL: ./deploy/scripts/fly-postgres.sh attach $APP_NAME"

exit 0 