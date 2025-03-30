#!/bin/bash
# Script to deploy a PostgreSQL database to Fly.io

set -e

# Configuration
DB_NAME=${FLY_DB_NAME:-"meal-manager-db"}
REGION=${FLY_REGION:-"yul"}
VOLUME_SIZE=${POSTGRES_VOLUME_SIZE:-"10"}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-""}

# Check if password is provided
if [ -z "$POSTGRES_PASSWORD" ]; then
    echo "Error: POSTGRES_PASSWORD environment variable must be set"
    echo "Usage: POSTGRES_PASSWORD=your_secure_password ./$0"
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

# Create the Postgres app
echo "Creating PostgreSQL app: $DB_NAME"
if ! flyctl apps list | grep -q "$DB_NAME"; then
    flyctl apps create "$DB_NAME" --machines
else
    echo "App $DB_NAME already exists"
fi

# Create a volume for PostgreSQL data
echo "Creating volume for PostgreSQL data..."
if ! flyctl volumes list --app "$DB_NAME" | grep -q "postgres_data"; then
    flyctl volumes create postgres_data --app "$DB_NAME" --size "$VOLUME_SIZE" --region "$REGION"
else
    echo "Volume postgres_data already exists"
fi

# Create the PostgreSQL machine
echo "Deploying PostgreSQL machine..."
flyctl machine run postgres:14-alpine \
    --app "$DB_NAME" \
    --name "${DB_NAME}-vm" \
    --region "$REGION" \
    --volume "postgres_data:/var/lib/postgresql/data" \
    --port "5432:5432/tcp" \
    --env "POSTGRES_PASSWORD=${POSTGRES_PASSWORD}" \
    --env "POSTGRES_USER=mealmanager" \
    --env "POSTGRES_DB=mealmanager" \
    --cpu-kind shared \
    --memory 512

echo "PostgreSQL deployment complete!"
echo "Your PostgreSQL database is now available within the Fly.io private network at: ${DB_NAME}.internal:5432"
echo "Connection string: postgres://mealmanager:${POSTGRES_PASSWORD}@${DB_NAME}.internal:5432/mealmanager"
echo ""
echo "To check the application status:"
echo "flyctl status --app $DB_NAME"
echo ""
echo "To view logs:"
echo "flyctl logs --app $DB_NAME" 