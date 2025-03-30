#!/bin/bash
# Script to deploy a RabbitMQ instance to Fly.io

set -e

# Configuration
MQ_NAME=${FLY_RABBITMQ_NAME:-"meal-manager-mq"}
REGION=${FLY_REGION:-"yul"}
VOLUME_SIZE=${RABBITMQ_VOLUME_SIZE:-"1"}
RABBITMQ_PASSWORD=${RABBITMQ_PASSWORD:-""}

# Check if password is provided
if [ -z "$RABBITMQ_PASSWORD" ]; then
    echo "Error: RABBITMQ_PASSWORD environment variable must be set"
    echo "Usage: RABBITMQ_PASSWORD=your_secure_password ./$0"
    exit 1
fi

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

# Create the RabbitMQ app
echo "Creating RabbitMQ app: $MQ_NAME"
if ! flyctl apps list | grep -q "$MQ_NAME"; then
    flyctl apps create "$MQ_NAME" --machines
else
    echo "App $MQ_NAME already exists"
fi

# Create a volume for RabbitMQ data
echo "Creating volume for RabbitMQ data..."
if ! flyctl volumes list --app "$MQ_NAME" | grep -q "rabbitmq_data"; then
    flyctl volumes create rabbitmq_data --app "$MQ_NAME" --size "$VOLUME_SIZE" --region "$REGION"
else
    echo "Volume rabbitmq_data already exists"
fi

# Create the RabbitMQ machine
echo "Deploying RabbitMQ machine..."
flyctl machine run rabbitmq:3-management-alpine \
    --app "$MQ_NAME" \
    --name "${MQ_NAME}-vm" \
    --region "$REGION" \
    --volume "rabbitmq_data:/var/lib/rabbitmq" \
    --port "5672:5672/tcp" \
    --port "15672:15672/tcp:http" \
    --env "RABBITMQ_DEFAULT_USER=mealmanager" \
    --env "RABBITMQ_DEFAULT_PASS=${RABBITMQ_PASSWORD}" \
    --cpu-kind shared \
    --memory 512

echo "RabbitMQ deployment complete!"
echo "Your RabbitMQ instance is now available within the Fly.io private network at: ${MQ_NAME}.internal:5672"
echo "Connection string: amqp://mealmanager:${RABBITMQ_PASSWORD}@${MQ_NAME}.internal:5672"
echo "Management interface: https://${MQ_NAME}.fly.dev:15672"
echo ""
echo "To check the application status:"
echo "flyctl status --app $MQ_NAME"
echo ""
echo "To view logs:"
echo "flyctl logs --app $MQ_NAME" 