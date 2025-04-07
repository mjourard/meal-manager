#!/bin/bash
set -e

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source the utilities
source "$SCRIPT_DIR/util/config.sh"

# Load configuration from fly.env
load_config || exit 1

# Default values (will be overridden by fly.env if present)
DB_APP_NAME="${DB_APP_NAME:-meal-manager-db}"
MAIN_APP_NAME="${APP_NAME:-meal-manager}"
ORG="${ORG:-personal}"
REGION="${REGION:-yul}"
VOLUME_SIZE="${DB_VOLUME_SIZE:-1}"
POSTGRES_VERSION="${POSTGRES_VERSION:-15}"
ACTION="setup"
SHOW_INFO="false"
ATTACH_APP=""

# Help text
function show_help {
  echo "Usage: $0 [options] [command]"
  echo ""
  echo "Commands:"
  echo "  setup              : Create and configure a PostgreSQL database (default)"
  echo "  info               : Show database information"
  echo "  backup             : Create a backup of the database"
  echo "  restore BACKUP_ID  : Restore database from a backup"
  echo "  attach APP_NAME    : Attach database to another Fly.io app"
  echo ""
  echo "Options:"
  echo "  -n DB_NAME        : Database app name (default: $DB_APP_NAME)"
  echo "  -a MAIN_APP_NAME  : Main application name (default: $MAIN_APP_NAME)"
  echo "  -o ORGANIZATION   : Fly.io organization (default: $ORG)"
  echo "  -r REGION         : Primary region (default: $REGION)"
  echo "  -s VOLUME_SIZE    : Volume size in GB (default: $VOLUME_SIZE)"
  echo "  -v VERSION        : PostgreSQL version (default: $POSTGRES_VERSION)"
  echo ""
  echo "Examples:"
  echo "  $0                 # Setup PostgreSQL with default settings"
  echo "  $0 -n custom-db -s 5  # Setup PostgreSQL with custom name and 5GB storage"
  echo "  $0 info           # Show database information"
  echo "  $0 backup         # Create a backup"
  echo "  $0 restore abcd1234  # Restore from backup with ID abcd1234"
  echo "  $0 attach my-other-app  # Attach DB to 'my-other-app'"
}

# Parse command line arguments
while getopts "n:a:o:r:s:v:h" opt; do
  case $opt in
    n) DB_APP_NAME="$OPTARG" ;;
    a) MAIN_APP_NAME="$OPTARG" ;;
    o) ORG="$OPTARG" ;;
    r) REGION="$OPTARG" ;;
    s) VOLUME_SIZE="$OPTARG" ;;
    v) POSTGRES_VERSION="$OPTARG" ;;
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
        backup)
            ACTION="backup"
            ;;
        restore)
            ACTION="restore"
            if [ $# -lt 2 ]; then
                log_error "Missing BACKUP_ID for restore command."
                show_help
                exit 1
            fi
            BACKUP_ID="$2"
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

# Function to setup Postgres
function setup_postgres {
    log_header "Setting up PostgreSQL database: ${DB_APP_NAME}"
    
    # Check if the app already exists
    if flyctl apps list | grep -q "^$DB_APP_NAME"; then
        log_warning "Database app $DB_APP_NAME already exists."
        
        # Show current database information
        log_info "Current database information:"
        flyctl postgres config show --app "$DB_APP_NAME"
        
        log_warning "To attach this database to your main app, run:"
        log_info "  ./deploy/scripts/fly-postgres.sh attach $MAIN_APP_NAME"
        
        return 0
    fi
    
    # Create PostgreSQL cluster
    log_step "Creating PostgreSQL cluster..."
    flyctl postgres create \
        --name "$DB_APP_NAME" \
        --org "$ORG" \
        --region "$REGION" \
        --vm-size shared-cpu-1x \
        --volume-size "$VOLUME_SIZE" \
        --initial-cluster-size 1 
        # --postgres-version "$POSTGRES_VERSION" # no flag called this
    
    # Check if the operation was successful
    if [ $? -ne 0 ]; then
        log_error "Failed to create PostgreSQL cluster."
        exit 1
    fi
    
    # Attach to main app if it exists
    if flyctl apps list | grep -q "^$MAIN_APP_NAME"; then
        log_step "Attaching database to main app: $MAIN_APP_NAME"
        attach_to_app "$MAIN_APP_NAME"
    else
        log_warning "Main app $MAIN_APP_NAME does not exist yet."
        log_info "After creating your main app, attach the database with:"
        log_info "  ./deploy/scripts/fly-postgres.sh attach $MAIN_APP_NAME"
    fi
    
    log_success "PostgreSQL setup complete!"
    
    # Show the connection details
    log_info "Database connection details:"
    flyctl postgres config show --app "$DB_APP_NAME"
}

# Function to attach database to an app
function attach_to_app {
    local app_name="$1"
    
    log_step "Attaching database $DB_APP_NAME to app $app_name..."
    
    # Check if target app exists
    if ! flyctl apps list | grep -q "^$app_name"; then
        log_error "App $app_name does not exist."
        exit 1
    fi
    
    # Attach the database
    flyctl postgres attach "$DB_APP_NAME" \
        --app "$app_name"
    
    if [ $? -ne 0 ]; then
        log_error "Failed to attach database to app."
        exit 1
    fi
    
    log_success "Database successfully attached to $app_name!"
    log_info "Environment variables have been set in your app."
    log_info "These include: DATABASE_URL, POSTGRES_DATABASE, POSTGRES_HOST, POSTGRES_PASSWORD, POSTGRES_PORT, POSTGRES_USER"
}

# Function to create a backup
function create_backup {
    log_header "Creating backup of database $DB_APP_NAME..."
    
    # Check if the app exists
    if ! flyctl apps list | grep -q "^$DB_APP_NAME"; then
        log_error "Database app $DB_APP_NAME does not exist."
        exit 1
    fi
    
    # Create backup
    flyctl postgres backup create --app "$DB_APP_NAME"
    
    if [ $? -ne 0 ]; then
        log_error "Failed to create backup."
        exit 1
    fi
    
    log_success "Backup created successfully!"
    
    # List available backups
    log_info "Available backups:"
    flyctl postgres backups list --app "$DB_APP_NAME"
}

# Function to restore from backup
function restore_from_backup {
    log_header "Restoring database $DB_APP_NAME from backup $BACKUP_ID..."
    
    # Check if the app exists
    if ! flyctl apps list | grep -q "^$DB_APP_NAME"; then
        log_error "Database app $DB_APP_NAME does not exist."
        exit 1
    fi
    
    # Restore from backup
    flyctl postgres backup restore "$BACKUP_ID" --app "$DB_APP_NAME"
    
    if [ $? -ne 0 ]; then
        log_error "Failed to restore from backup."
        exit 1
    fi
    
    log_success "Database restored successfully!"
}

# Function to show information
function show_db_info {
    log_header "Database information for $DB_APP_NAME:"
    
    # Check if the app exists
    if ! flyctl apps list | grep -q "^$DB_APP_NAME"; then
        log_error "Database app $DB_APP_NAME does not exist."
        exit 1
    fi
    
    # Show database info
    flyctl postgres config show --app "$DB_APP_NAME"
    
    # Show database status
    log_info "Database status:"
    flyctl status --app "$DB_APP_NAME"
    
    # List available backups
    log_info "Available backups:"
    flyctl postgres backups list --app "$DB_APP_NAME"
}

# Execute the requested action
case "$ACTION" in
    setup)
        setup_postgres
        ;;
    info)
        show_db_info
        ;;
    backup)
        create_backup
        ;;
    restore)
        restore_from_backup
        ;;
    attach)
        attach_to_app "$ATTACH_APP"
        ;;
esac

exit 0 