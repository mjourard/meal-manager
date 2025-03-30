#!/bin/bash
# Script to build and deploy the Meal Manager backend to Fly.io

set -e

# Configuration
APP_NAME=${FLY_APP_NAME:-"meal-manager"}
DOCKERFILE_PATH="./api/Dockerfile.fly"
REGION=${FLY_REGION:-"yul"}

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "flyctl is not installed. Installing now..."
    curl -L https://fly.io/install.sh | sh
    
    # Add flyctl to the PATH for this session
    export FLYCTL_INSTALL="/home/$(whoami)/.fly"
    export PATH="$FLYCTL_INSTALL/bin:$PATH"
fi

# Check if authenticated
if ! flyctl auth whoami &> /dev/null; then
    echo "Not authenticated with Fly.io. Please run 'flyctl auth login' first."
    exit 1
fi

# Check if Dockerfile exists
if [ ! -f "$DOCKERFILE_PATH" ]; then
    echo "Dockerfile not found at $DOCKERFILE_PATH"
    exit 1
fi

# Build and push the Docker image
echo "Building and pushing Docker image to Fly.io..."

# Move to the root directory
cd "$(dirname "$0")/../.."

# Create Docker image
echo "Building Docker image..."
docker build -t "$APP_NAME" -f "$DOCKERFILE_PATH" ./api

# Create or verify app exists
if ! flyctl apps list | grep -q "$APP_NAME"; then
    echo "Creating Fly.io app: $APP_NAME"
    flyctl apps create "$APP_NAME" --machines
else
    echo "Using existing Fly.io app: $APP_NAME"
fi

# Deploy the image
echo "Deploying to Fly.io..."
flyctl deploy --app "$APP_NAME" --image "$APP_NAME" --region "$REGION" --config ./api/fly.toml

echo "Deployment complete! Your API should be available at https://$APP_NAME.fly.dev"
echo "If DNS is configured, it should also be available at your custom domain."
echo ""
echo "To check the application status:"
echo "flyctl status --app $APP_NAME"
echo ""
echo "To view logs:"
echo "flyctl logs --app $APP_NAME" 