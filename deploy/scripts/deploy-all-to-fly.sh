#!/bin/bash
# Master script to deploy the entire Meal Manager application to Fly.io

set -e

# Change to the scripts directory
cd "$(dirname "$0")"

# Configuration
FLY_APP_NAME=${FLY_APP_NAME:-"meal-manager"}
FLY_DB_NAME=${FLY_DB_NAME:-"meal-manager-db"}
FLY_RABBITMQ_NAME=${FLY_RABBITMQ_NAME:-"meal-manager-mq"}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-""}
RABBITMQ_PASSWORD=${RABBITMQ_PASSWORD:-$POSTGRES_PASSWORD}
FLY_REGION=${FLY_REGION:-"yul"}

# Check if passwords are provided
if [ -z "$POSTGRES_PASSWORD" ]; then
    echo "Error: POSTGRES_PASSWORD environment variable must be set"
    echo "Usage: POSTGRES_PASSWORD=your_secure_password ./$0"
    exit 1
fi

# Default RabbitMQ password to PostgreSQL password if not set
if [ -z "$RABBITMQ_PASSWORD" ]; then
    RABBITMQ_PASSWORD=$POSTGRES_PASSWORD
    echo "RABBITMQ_PASSWORD not set, using POSTGRES_PASSWORD instead"
fi

# Export variables for the subscripts
export FLY_APP_NAME
export FLY_DB_NAME
export FLY_RABBITMQ_NAME
export POSTGRES_PASSWORD
export RABBITMQ_PASSWORD
export FLY_REGION

echo "=== Starting Meal Manager Deployment to Fly.io ==="
echo ""

# Step 1: Deploy PostgreSQL
echo "Step 1: Deploying PostgreSQL..."
./deploy-postgres-to-fly.sh
echo ""

# Step 2: Deploy RabbitMQ
echo "Step 2: Deploying RabbitMQ..."
./deploy-rabbitmq-to-fly.sh
echo ""

# Step 3: Deploy Spring Boot API
echo "Step 3: Deploying Spring Boot API..."
./deploy-to-fly.sh
echo ""

echo "=== Deployment Complete ==="
echo ""
echo "Your Meal Manager application is now deployed on Fly.io:"
echo "- API: https://${FLY_APP_NAME}.fly.dev"
echo "- PostgreSQL: ${FLY_DB_NAME}.internal:5432 (internal network only)"
echo "- RabbitMQ: ${FLY_RABBITMQ_NAME}.internal:5672 (internal network only)"
echo "- RabbitMQ Management: https://${FLY_RABBITMQ_NAME}.fly.dev:15672"
echo ""
echo "Next steps:"
echo "1. Deploy the frontend using Terraform:"
echo "   cd ../terraform/manifests"
echo "   terraform init"
echo "   terraform apply"
echo ""
echo "2. Update your DNS settings if needed"
echo ""
echo "3. Visit your application at https://app.yourdomain.com" 