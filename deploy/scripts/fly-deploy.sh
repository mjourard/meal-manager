#!/bin/bash
set -e

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "SCRIPT_DIR: $SCRIPT_DIR"

# Source the utilities
source "$SCRIPT_DIR/util/config.sh"

# Load configuration from fly.env
load_config || exit 1

# Default values (will be overridden by fly.env if present)
APP_NAME="${APP_NAME:-meal-manager}"
REGION="${REGION:-yul}"
SKIP_BUILD=false
USE_REMOTE_BUILDER=false
DETACH=false

# Path to API directory and fly.toml
API_DIR="$SCRIPT_DIR/../../api"
echo "API_DIR: $API_DIR"
FLY_TOML="$API_DIR/fly.toml"

# Help text
function show_help {
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -a APP_NAME      : Application name (default: $APP_NAME)"
  echo "  -r REGION        : Deploy to a specific region (default: $REGION)"
  echo "  -s               : Skip Maven build (use existing jar)"
  echo "  -b               : Use remote Docker builder"
  echo "  -d               : Detach - don't wait for deployment to complete"
  echo "  -h               : Show this help"
  echo ""
  echo "Examples:"
  echo "  $0                      # Build and deploy with local Docker"
  echo "  $0 -s                   # Skip build, just deploy existing jar"
  echo "  $0 -r sin -b            # Deploy to Singapore using remote builder"
  echo "  $0 -d                   # Deploy in the background"
}

# Parse command line arguments
while getopts "a:r:sbdh" opt; do
  case $opt in
    a) APP_NAME="$OPTARG" ;;
    r) REGION="$OPTARG" ;;
    s) SKIP_BUILD=true ;;
    b) USE_REMOTE_BUILDER=true ;;
    d) DETACH=true ;;
    h) show_help; exit 0 ;;
    \?) log_error "Invalid option -$OPTARG"; exit 1 ;;
  esac
done

# Validate prerequisites
validate_prerequisites || exit 1

log_header "Deploying $APP_NAME to Fly.io"

# Check if app exists
if ! flyctl apps list | grep -q "^$APP_NAME"; then
    log_error "App $APP_NAME does not exist!"
    log_info "Create it first with: ./deploy/scripts/fly-setup.sh -a $APP_NAME"
    exit 1
fi

# Build the Maven project if not skipping
if [ "$SKIP_BUILD" = false ]; then
    log_step "Building application with Maven..."
    cd "$API_DIR"
    
    if ! command -v mvn &> /dev/null; then
        log_error "Maven is not installed."
        exit 1
    fi
    
    mvn clean package -DskipTests -Denvfile.skip=true
    
    if [ $? -ne 0 ]; then
        log_error "Maven build failed."
        exit 1
    fi
    
    log_success "Maven build completed successfully."
    cd - > /dev/null
fi

# Check if fly.toml exists
if [ ! -f "$FLY_TOML" ]; then
    log_error "Could not find fly.toml at $FLY_TOML"
    log_info "Please make sure the file exists."
    exit 1
fi

# Update fly.toml with the current app name and region
log_step "Updating fly.toml configuration..."
# Create a backup of the original file
cp "$FLY_TOML" "${FLY_TOML}.bak"
# Update app name and region
sed -i "s/^app = .*/app = \"$APP_NAME\"/" "$FLY_TOML"
sed -i "s/^primary_region = .*/primary_region = \"$REGION\"/" "$FLY_TOML"
log_info "Updated fly.toml with app name: $APP_NAME and region: $REGION"

# Construct deploy command
DEPLOY_CMD="flyctl deploy --app $APP_NAME"

# Add remote builder flag if requested
if [ "$USE_REMOTE_BUILDER" = true ]; then
    DEPLOY_CMD="$DEPLOY_CMD --remote-only"
    log_info "Using remote Docker builder"
fi

# Add detach flag if requested
if [ "$DETACH" = true ]; then
    DEPLOY_CMD="$DEPLOY_CMD --detach"
    log_info "Detaching - deployment will continue in the background"
fi

# Deploy the application
log_step "Deploying to Fly.io..."
cd "$API_DIR"

log_debug "Running: $DEPLOY_CMD"
eval "$DEPLOY_CMD"

DEPLOY_STATUS=$?

# Restore the original fly.toml
log_step "Restoring original fly.toml..."
mv "${FLY_TOML}.bak" "$FLY_TOML"

if [ $DEPLOY_STATUS -ne 0 ]; then
    log_error "Deployment failed."
    exit 1
fi

log_success "Deployment completed successfully!"
log_info "Your app is running at: https://$APP_NAME.fly.dev"

exit 0 