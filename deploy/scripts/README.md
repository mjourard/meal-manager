# Fly.io Deployment Scripts

This directory contains scripts for managing your Meal Manager API deployment on Fly.io.

## Prerequisites

1. Install the Fly.io CLI:
   ```bash
      # For Linux
   curl -L https://fly.io/install.sh | sh
   
   ```

2. Authenticate with Fly.io:
   ```bash
   flyctl auth login
   ```

## Configuration

All scripts use a shared configuration file `fly.env` located in the `deploy/scripts` directory. This file contains non-secret configuration values such as application names, regions, and resource allocations.

You can edit this file to customize the default values used by all scripts:

```bash
# Edit the configuration file
vi deploy/scripts/fly.env
```

Individual scripts also accept command-line options that override the values from `fly.env`.

## Available Scripts

### Setup: `fly-setup.sh`

Sets up a new Fly.io application or updates an existing one.

```bash
# Create a new app with default settings
./deploy/scripts/fly-setup.sh

# Create a new app with custom settings
./deploy/scripts/fly-setup.sh -a custom-app-name -r sin -o your-org -m 2048 -c 2

# Show help
./deploy/scripts/fly-setup.sh -h
```

Options:
- `-a APP_NAME`: Application name (default: from fly.env)
- `-r REGION`: Primary region (default: from fly.env)
- `-o ORGANIZATION`: Fly.io organization (default: from fly.env)
- `-m MEMORY_MB`: Memory in MB (default: from fly.env)
- `-c CPU_COUNT`: CPU count (default: from fly.env)

### Deployment: `fly-deploy.sh`

Builds and deploys your application to Fly.io.

```bash
# Build and deploy with local Docker
./deploy/scripts/fly-deploy.sh

# Skip the build step (use existing JAR)
./deploy/scripts/fly-deploy.sh -s

# Deploy to a specific region with remote builder
./deploy/scripts/fly-deploy.sh -r yul -b

# Deploy without waiting (background)
./deploy/scripts/fly-deploy.sh -d

# Show help
./deploy/scripts/fly-deploy.sh -h
```

Options:
- `-a APP_NAME`: Application name (default: from fly.env)
- `-r REGION`: Deploy to specific region (default: from fly.env)
- `-s`: Skip Maven build (use existing jar)
- `-b`: Use remote Docker builder
- `-d`: Detach - don't wait for deployment to complete

### PostgreSQL: `fly-postgres.sh`

Sets up and manages a PostgreSQL database for your application.

```bash
# Create a new PostgreSQL database with default settings
./deploy/scripts/fly-postgres.sh

# Create a database with custom name and 5GB storage
./deploy/scripts/fly-postgres.sh -n custom-db -s 5

# Show database information
./deploy/scripts/fly-postgres.sh info

# Create a backup
./deploy/scripts/fly-postgres.sh backup

# Restore from a backup
./deploy/scripts/fly-postgres.sh restore backup-id

# Attach database to your application
./deploy/scripts/fly-postgres.sh attach meal-manager

# Show help
./deploy/scripts/fly-postgres.sh -h
```

Commands:
- `setup`: Create and configure a PostgreSQL database (default)
- `info`: Show database information
- `backup`: Create a backup of the database
- `restore BACKUP_ID`: Restore database from a backup
- `attach APP_NAME`: Attach database to another Fly.io app

Options:
- `-n DB_NAME`: Database app name (default: from fly.env)
- `-a MAIN_APP_NAME`: Main application name (default: from fly.env)
- `-o ORGANIZATION`: Fly.io organization (default: from fly.env)
- `-r REGION`: Primary region (default: from fly.env)
- `-s VOLUME_SIZE`: Volume size in GB (default: from fly.env)
- `-v VERSION`: PostgreSQL version (default: from fly.env)

### RabbitMQ: `fly-rabbitmq.sh`

Sets up and manages a RabbitMQ server for your application.

```bash
# Create a new RabbitMQ server with default settings
./deploy/scripts/fly-rabbitmq.sh

# Create RabbitMQ with custom name and 2GB storage
./deploy/scripts/fly-rabbitmq.sh -n custom-mq -s 2

# Show RabbitMQ information
./deploy/scripts/fly-rabbitmq.sh info

# Restart RabbitMQ server
./deploy/scripts/fly-rabbitmq.sh restart

# Attach RabbitMQ to your application
./deploy/scripts/fly-rabbitmq.sh attach meal-manager

# Show help
./deploy/scripts/fly-rabbitmq.sh -h
```

Commands:
- `setup`: Create and configure a RabbitMQ server (default)
- `info`: Show RabbitMQ server information
- `restart`: Restart the RabbitMQ server
- `attach APP_NAME`: Attach RabbitMQ to another Fly.io app

Options:
- `-n MQ_NAME`: RabbitMQ app name (default: from fly.env)
- `-a MAIN_APP_NAME`: Main application name (default: from fly.env)
- `-o ORGANIZATION`: Fly.io organization (default: from fly.env)
- `-r REGION`: Primary region (default: from fly.env)
- `-s VOLUME_SIZE`: Volume size in GB (default: from fly.env)
- `-v VERSION`: RabbitMQ version (default: from fly.env)

### Secrets Management: `fly-secrets.sh`

Manage environment variables and secrets for your application.

```bash
# List all secrets
./deploy/scripts/fly-secrets.sh list

# Set a single secret
./deploy/scripts/fly-secrets.sh set DB_PASSWORD=mypassword

# Remove a secret
./deploy/scripts/fly-secrets.sh remove DB_PASSWORD

# Import secrets from .env file
./deploy/scripts/fly-secrets.sh import fly_secrets.env.dist

# Show help
./deploy/scripts/fly-secrets.sh -h
```

Commands:
- `list`: List all secrets
- `set NAME=VALUE`: Set one or more secrets
- `remove NAME`: Remove one or more secrets
- `import FILE`: Import secrets from a .env file

Options:
- `-a APP_NAME`: Application name (default: from fly.env)

### Scaling: `fly-scale.sh`

Manage the scaling configuration of your application.

```bash
# Show current scaling settings
./deploy/scripts/fly-scale.sh -s

# Set CPU and memory
./deploy/scripts/fly-scale.sh -c 1 -m 512

# Set minimum and maximum instance count
./deploy/scripts/fly-scale.sh -n 2 -x 5

# Show help
./deploy/scripts/fly-scale.sh -h
```

Options:
- `-a APP_NAME`: Application name (default: from fly.env)
- `-c CPU`: Set CPU count (e.g., 1, 2, 4, 8)
- `-m MEMORY`: Set memory in MB (e.g., 256, 512, 1024, 2048)
- `-n MIN_COUNT`: Set minimum number of instances
- `-x MAX_COUNT`: Set maximum number of instances
- `-s`: Show current scaling settings

## Complete Deployment Workflow

Here's a typical workflow for deploying the complete Meal Manager application stack:

1. **Setup PostgreSQL Database**:
   ```bash
   ./deploy/scripts/fly-postgres.sh
   ```

2. **Setup RabbitMQ Server**:
   ```bash
   ./deploy/scripts/fly-rabbitmq.sh
   ```

3. **Setup API Application**:
   ```bash
   ./deploy/scripts/fly-setup.sh
   ```

4. **Configure API Secrets**:
   ```bash
   ./deploy/scripts/fly-secrets.sh import fly_secrets.env.dist
   ```

5. **Attach Database and RabbitMQ to API**:
   ```bash
   ./deploy/scripts/fly-postgres.sh attach meal-manager
   ./deploy/scripts/fly-rabbitmq.sh attach meal-manager
   ```

6. **Deploy API Application**:
   ```bash
   ./deploy/scripts/fly-deploy.sh
   ```

7. **Scale as Needed**:
   ```bash
   ./deploy/scripts/fly-scale.sh -n 2 -x 5
   ```

## Troubleshooting

If you encounter issues with these scripts:

1. Ensure the scripts have execute permissions:
   ```bash
   chmod +x deploy/scripts/*.sh
   ```

2. Check the Fly.io status:
   ```bash
   flyctl status
   ```

3. View application logs:
   ```bash
   flyctl logs
   ```

4. Get application information:
   ```bash
   flyctl info
   ```

5. Check database connection:
   ```bash
   flyctl postgres connect --app meal-manager-db
   ```

6. Check RabbitMQ management UI:
   ```bash
   flyctl open --app meal-manager-mq
   ```

7. Enable debug mode in fly.env:
   ```bash
   # Edit fly.env and set
   DEBUG="true"
   ``` 