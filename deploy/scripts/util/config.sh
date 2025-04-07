#!/bin/bash

# Path to this script
UTIL_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Path to the scripts directory
SCRIPTS_DIR="$(dirname "$UTIL_SCRIPT_DIR")"
# Path to the fly.env file
FLY_ENV_FILE="$SCRIPTS_DIR/fly.env"

# Source the logging utilities
source "$UTIL_SCRIPT_DIR/logging.sh"

# Function to load configuration
function load_config() {
    if [ -f "$FLY_ENV_FILE" ]; then
        log_debug "Loading configuration from $FLY_ENV_FILE"
        # shellcheck source=../fly.env
        source "$FLY_ENV_FILE"
    else
        log_error "Configuration file not found: $FLY_ENV_FILE"
        return 1
    fi
    
    log_debug "Configuration loaded successfully"
    return 0
}

# Function to display current configuration
function show_config() {
    log_header "Current Configuration"
    log_info "Application: $APP_NAME"
    log_info "Database: $DB_APP_NAME"
    log_info "RabbitMQ: $MQ_APP_NAME"
    log_info "Organization: $ORG"
    log_info "Region: $REGION"
    log_info "Memory: $MEMORY_MB MB"
    log_info "CPU Count: $CPU_COUNT"
    log_separator
}

# Function to validate required commands
function validate_prerequisites() {
    log_debug "Validating prerequisites"
    
    # Check for flyctl
    if ! check_command "flyctl"; then
        log_error "fly CLI is not installed."
        log_info "Please install it by following the instructions at https://fly.io/docs/hands-on/install-flyctl/"
        return 1
    fi
    
    # Check if user is authenticated
    if ! flyctl auth whoami &> /dev/null; then
        log_warning "You need to authenticate with Fly.io"
        flyctl auth login
        if [ $? -ne 0 ]; then
            log_error "Failed to authenticate with Fly.io"
            return 1
        fi
    fi
    
    log_debug "Prerequisites validated successfully"
    return 0
}

# Export functions
export -f load_config
export -f show_config
export -f validate_prerequisites 