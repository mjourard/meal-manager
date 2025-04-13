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
COMMAND="list"
SECRET_NAME=""
SECRET_VALUE=""
FILE_PATH=""

# Help text
function show_help {
  echo "Usage: $0 [options] [command]"
  echo ""
  echo "Commands:"
  echo "  list                       : List all secrets (default)"
  echo "  set NAME=VALUE [NAME=VALUE ...] : Set one or more secrets"
  echo "  remove NAME [NAME ...]     : Remove one or more secrets"
  echo "  import FILE                : Import secrets from a .env file"
  echo ""
  echo "Options:"
  echo "  -a APP_NAME      : Application name (default: $APP_NAME)"
  echo "  -h               : Show this help"
  echo ""
  echo "Examples:"
  echo "  $0 list                         # List all secrets"
  echo "  $0 set DB_PASSWORD=mypassword   # Set a single secret"
  echo "  $0 set KEY1=value1 KEY2=value2  # Set multiple secrets"
  echo "  $0 remove DB_PASSWORD           # Remove a secret"
  echo "  $0 import fly_secrets.env.dist  # Import from .env file"
}

# Parse command line arguments
while getopts "a:h" opt; do
  case $opt in
    a) APP_NAME="$OPTARG" ;;
    h) show_help; exit 0 ;;
    \?) log_error "Invalid option -$OPTARG"; exit 1 ;;
  esac
done

shift $((OPTIND-1))

# Process command argument
if [ $# -gt 0 ]; then
    COMMAND="$1"
    shift
    
    case "$COMMAND" in
        list)
            # No additional arguments needed
            ;;
        set)
            if [ $# -lt 1 ]; then
                log_error "Missing NAME=VALUE pair(s) for set command."
                show_help
                exit 1
            fi
            # The remaining arguments are NAME=VALUE pairs
            ;;
        remove)
            if [ $# -lt 1 ]; then
                log_error "Missing NAME(s) for remove command."
                show_help
                exit 1
            fi
            # The remaining arguments are secret names to remove
            ;;
        import)
            if [ $# -lt 1 ]; then
                log_error "Missing FILE for import command."
                show_help
                exit 1
            fi
            FILE_PATH="$1"
            ;;
        help)
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown command: $COMMAND"
            show_help
            exit 1
            ;;
    esac
fi

# Validate prerequisites
validate_prerequisites || exit 1

# Check if app exists
if ! flyctl apps list | grep -q "^$APP_NAME"; then
    log_error "App $APP_NAME does not exist!"
    log_info "Create it first with: ./deploy/scripts/fly-setup.sh -a $APP_NAME"
    exit 1
fi

# Function to list secrets
function list_secrets {
    log_header "Listing secrets for $APP_NAME"
    flyctl secrets list --app "$APP_NAME"
}

# Function to set secrets
function set_secrets {
    log_header "Setting secrets for $APP_NAME"
    
    # Construct the command with all the NAME=VALUE pairs
    CMD="flyctl secrets set --app $APP_NAME"
    for arg in "$@"; do
        # Validate that it's in the format NAME=VALUE
        if [[ "$arg" != *"="* ]]; then
            log_error "Invalid format for secret: $arg. Must be NAME=VALUE."
            exit 1
        fi
        
        CMD="$CMD $arg"
    done
    
    log_debug "Running: $CMD"
    eval "$CMD"
    
    if [ $? -ne 0 ]; then
        log_error "Failed to set secrets."
        exit 1
    fi
    
    log_success "Secrets set successfully."
}

# Function to remove secrets
function remove_secrets {
    log_header "Removing secrets from $APP_NAME"
    
    for secret in "$@"; do
        log_step "Removing secret: $secret"
        flyctl secrets unset "$secret" --app "$APP_NAME"
        
        if [ $? -ne 0 ]; then
            log_error "Failed to remove secret: $secret"
            exit 1
        fi
    done
    
    log_success "Secrets removed successfully."
}

# Function to import secrets from a file
function import_secrets {
    local file="$1"
    
    if [ ! -f "$file" ]; then
        log_error "File not found: $file"
        exit 1
    fi
    
    log_header "Importing secrets from $file to $APP_NAME"
    
    # Read the file line by line
    local secrets=()
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip empty lines and comments
        if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
            continue
        fi
        
        # Check if line has a valid format (NAME=VALUE)
        if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
            secrets+=("$line")
        else
            log_warning "Skipping invalid line: $line"
        fi
    done < "$file"
    
    if [ ${#secrets[@]} -eq 0 ]; then
        log_warning "No valid secrets found in $file"
        return 0
    fi
    
    # Set all the secrets at once
    set_secrets "${secrets[@]}"
}

# Execute the requested action
case "$COMMAND" in
    list)
        list_secrets
        ;;
    set)
        set_secrets "$@"
        ;;
    remove)
        remove_secrets "$@"
        ;;
    import)
        import_secrets "$FILE_PATH"
        ;;
esac

exit 0 