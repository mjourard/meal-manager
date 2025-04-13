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
CPU_COUNT="${CPU_COUNT:-1}"
MEMORY_MB="${MEMORY_MB:-512}"
MIN_COUNT="${MIN_COUNT:-1}"
MAX_COUNT="${MAX_COUNT:-1}"
SHOW_CURRENT=false

# Help text
function show_help {
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -a APP_NAME      : Application name (default: $APP_NAME)"
  echo "  -c CPU           : Set CPU count (1, 2, 4, 8)"
  echo "  -m MEMORY        : Set memory in MB (256, 512, 1024, 2048)"
  echo "  -n MIN_COUNT     : Set minimum number of instances"
  echo "  -x MAX_COUNT     : Set maximum number of instances"
  echo "  -s               : Show current scaling settings"
  echo "  -h               : Show this help"
  echo ""
  echo "Examples:"
  echo "  $0 -s                     # Show current settings"
  echo "  $0 -c 1 -m 512            # Set CPU to 1 core and memory to 512MB"
  echo "  $0 -n 2 -x 5              # Set min instances to 2 and max to 5"
}

# Parse command line arguments
while getopts "a:c:m:n:x:sh" opt; do
  case $opt in
    a) APP_NAME="$OPTARG" ;;
    c) CPU_COUNT="$OPTARG" ;;
    m) MEMORY_MB="$OPTARG" ;;
    n) MIN_COUNT="$OPTARG" ;;
    x) MAX_COUNT="$OPTARG" ;;
    s) SHOW_CURRENT=true ;;
    h) show_help; exit 0 ;;
    \?) log_error "Invalid option -$OPTARG"; exit 1 ;;
  esac
done

# Validate prerequisites
validate_prerequisites || exit 1

# Check if app exists
if ! flyctl apps list | grep -q "^$APP_NAME"; then
    log_error "App $APP_NAME does not exist!"
    log_info "Create it first with: ./deploy/scripts/fly-setup.sh -a $APP_NAME"
    exit 1
fi

# Function to show current scaling settings
function show_current_settings {
    log_header "Current Scaling Settings for $APP_NAME"
    
    # Get current VM size
    VM_SIZE=$(flyctl scale show --app "$APP_NAME" 2>/dev/null | grep -oP 'VM Size: \K.*')
    if [ -n "$VM_SIZE" ]; then
        log_info "VM Size: $VM_SIZE"
    else
        log_warning "Unable to retrieve VM size."
    fi
    
    # Get current count
    log_info "Current Instances:"
    flyctl status --app "$APP_NAME" | grep -E 'Instance|VM'
    
    # Get autoscaling settings
    log_info "Autoscaling Settings:"
    flyctl autoscale show --app "$APP_NAME" 2>/dev/null || log_info "Autoscaling not configured"
}

# Show current settings if requested
if [ "$SHOW_CURRENT" = true ]; then
    show_current_settings
    exit 0
fi

# Check if any scale parameter was provided
MISSING_PARAMETERS="false"
if [ -z "$CPU_COUNT" ]; then
    log_warning "Missing scaling parameters 'CPU_COUNT'."
    MISSING_PARAMETERS="true"
fi
if [ -z "$MEMORY_MB" ]; then
    log_warning "Missing scaling parameters 'MEMORY_MB'."
    MISSING_PARAMETERS="true"
fi
if [ -z "$MIN_COUNT" ]; then
    log_warning "Missing scaling parameters 'MIN_COUNT'."
    MISSING_PARAMETERS="true"
fi
if [ -z "$MAX_COUNT" ]; then
    log_warning "Missing scaling parameters 'MAX_COUNT'."
    MISSING_PARAMETERS="true"
fi

if [ "$MISSING_PARAMETERS" = "true" ]; then
    log_warning "No scaling parameters provided."
    show_current_settings
    log_info "Use -c, -m, -n, -x to set scaling parameters."
    exit 0
fi

# Apply CPU and memory changes if provided
if [ -n "$CPU_COUNT" ] || [ -n "$MEMORY_MB" ]; then
    log_header "Scaling VM resources for $APP_NAME"
    
    SCALE_CMD="flyctl scale vm"
    
    if [ -n "$CPU_COUNT" ]; then
        SCALE_CMD="$SCALE_CMD shared-cpu-${CPU_COUNT}x"
        log_info "Setting CPU to: $CPU_COUNT core(s)"
    fi
    
    if [ -n "$MEMORY_MB" ]; then
        SCALE_CMD="$SCALE_CMD --memory $MEMORY_MB"
        log_info "Setting memory to: $MEMORY_MB MB"
    fi
    
    SCALE_CMD="$SCALE_CMD --app $APP_NAME"
    
    log_debug "Running: $SCALE_CMD"
    eval "$SCALE_CMD"
    
    if [ $? -ne 0 ]; then
        log_error "Failed to update VM resources."
        exit 1
    fi
    
    log_success "VM resources updated successfully."
fi

# Apply autoscaling changes if provided
if [ -n "$MIN_COUNT" ] || [ -n "$MAX_COUNT" ]; then
    log_header "Configuring autoscaling for $APP_NAME"
    
    AUTO_CMD="flyctl autoscale set"
    
    if [ -n "$MIN_COUNT" ]; then
        AUTO_CMD="$AUTO_CMD min=$MIN_COUNT"
        log_info "Setting minimum instances to: $MIN_COUNT"
    fi
    
    if [ -n "$MAX_COUNT" ]; then
        AUTO_CMD="$AUTO_CMD max=$MAX_COUNT"
        log_info "Setting maximum instances to: $MAX_COUNT"
    fi
    
    AUTO_CMD="$AUTO_CMD --app $APP_NAME"
    
    log_debug "Running: $AUTO_CMD"
    eval "$AUTO_CMD"
    
    if [ $? -ne 0 ]; then
        log_error "Failed to update autoscaling settings."
        exit 1
    fi
    
    log_success "Autoscaling configured successfully."
fi

# Show the updated settings
log_info "Updated scaling settings:"
show_current_settings

exit 0 