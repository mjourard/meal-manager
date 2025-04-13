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
DOMAIN="api.mealmanager.org"
ACTION="add"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Help text
function show_help {
  echo "Usage: $0 [options] [command]"
  echo ""
  echo "Commands:"
  echo "  add               : Add a new certificate for a domain (default)"
  echo "  list              : List all certificates for the app"
  echo "  check             : Check certificate status for a domain"
  echo "  remove            : Remove a certificate for a domain"
  echo ""
  echo "Options:"
  echo "  -a APP_NAME       : Application name (default: $APP_NAME)"
  echo "  -d DOMAIN         : Domain name (default: $DOMAIN)"
  echo "  -h                : Show this help"
  echo ""
  echo "Examples:"
  echo "  $0                            # Add certificate for api.mealmanager.org"
  echo "  $0 -d custom.example.com add  # Add certificate for custom.example.com"
  echo "  $0 list                      # List all certificates"
  echo "  $0 check                     # Check certificate status"
  echo "  $0 remove                    # Remove certificate"
}

# Parse command line arguments
while getopts "a:d:h" opt; do
  case $opt in
    a) APP_NAME="$OPTARG" ;;
    d) DOMAIN="$OPTARG" ;;
    h) show_help; exit 0 ;;
    \?) log_error "Invalid option -$OPTARG"; exit 1 ;;
  esac
done

# Skip already processed arguments
shift $((OPTIND-1))

# Process command argument
if [ $# -gt 0 ]; then
    case "$1" in
        add)
            ACTION="add"
            ;;
        list)
            ACTION="list"
            ;;
        check)
            ACTION="check"
            ;;
        remove)
            ACTION="remove"
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

# Check if app exists
if ! flyctl apps list | grep -q "^$APP_NAME"; then
    log_error "App $APP_NAME does not exist!"
    log_info "Create it first with: ./deploy/scripts/fly-setup.sh -a $APP_NAME"
    exit 1
fi

# Function to add a certificate
function add_certificate {
    log_header "Adding certificate for $DOMAIN to $APP_NAME"
    
    # Check if we already have a certificate for this domain
    if flyctl certs list --app "$APP_NAME" | grep -q "$DOMAIN"; then
        log_warning "Certificate for $DOMAIN already exists."
        check_certificate
        return 0
    fi
    
    log_step "Creating certificate for $DOMAIN..."
    flyctl certs create "$DOMAIN" --app "$APP_NAME"
    
    if [ $? -ne 0 ]; then
        log_error "Failed to create certificate for $DOMAIN."
        log_info "Make sure your DNS is properly configured with the following CNAME record:"
        log_info "  $DOMAIN CNAME $APP_NAME.fly.dev"
        exit 1
    fi
    
    log_success "Certificate creation initiated for $DOMAIN."
    log_info "It may take some time for the certificate to be issued and verified."
    log_info "Check the status with: ./deploy/scripts/fly-cert.sh check"
    
    # Show DNS settings
    log_info "DNS Configuration for $DOMAIN:"
    flyctl certs show "$DOMAIN" --app "$APP_NAME"
}

# Function to list certificates
function list_certificates {
    log_header "Listing certificates for $APP_NAME"
    flyctl certs list --app "$APP_NAME"
}

# Function to check certificate status
function check_certificate {
    log_header "Checking certificate status for $DOMAIN on $APP_NAME"
    flyctl certs show "$DOMAIN" --app "$APP_NAME"
    
    if [ $? -ne 0 ]; then
        log_error "Certificate for $DOMAIN not found."
        log_info "Add it first with: ./deploy/scripts/fly-cert.sh add"
        exit 1
    fi
}

# Function to remove a certificate
function remove_certificate {
    log_header "Removing certificate for $DOMAIN from $APP_NAME"
    
    # Check if we have a certificate for this domain
    if ! flyctl certs list --app "$APP_NAME" | grep -q "$DOMAIN"; then
        log_error "Certificate for $DOMAIN not found."
        exit 1
    fi
    
    log_step "Removing certificate for $DOMAIN..."
    flyctl certs remove "$DOMAIN" --app "$APP_NAME"
    
    if [ $? -ne 0 ]; then
        log_error "Failed to remove certificate for $DOMAIN."
        exit 1
    fi
    
    log_success "Certificate for $DOMAIN removed successfully."
}

# Execute the requested action
case "$ACTION" in
    add)
        add_certificate
        ;;
    list)
        list_certificates
        ;;
    check)
        check_certificate
        ;;
    remove)
        remove_certificate
        ;;
esac

log_info "Note: After adding a certificate, make sure your DNS is properly configured."
log_info "For api.mealmanager.org, ensure you have a CNAME record pointing to $APP_NAME.fly.dev"
log_info "or an appropriate A/AAAA record if you're using a dedicated IP address."

exit 0 