# Meal Manager Deployment Guide

This document provides detailed instructions for deploying the Meal Manager application using GitHub Actions and Terraform.

## Deployment Architecture

The Meal Manager application is deployed across multiple cloud providers to optimize for cost and performance:

- **Frontend**: Static React application hosted on Render (free tier)
- **Backend**: Spring Boot API deployed on Fly.io (free tier with generous limits)
- **Database**: PostgreSQL on Fly.io (shared CPU instances with volumes)
- **Message Broker**: RabbitMQ on Fly.io for asynchronous processing
- **DNS**: AWS Route53 for domain management

## Deployment Process

The deployment process is separated into two main steps:

1. **Build & Push API Docker Image**: Automated via GitHub Actions
2. **Deploy Infrastructure**: Managed via Terraform

This separation provides several benefits:
- Secure handling of secrets
- Clear separation of concerns
- Ability to roll back container images independently of infrastructure

## Setting Up GitHub Actions

### Prerequisites

1. GitHub repository with GitHub Actions enabled
2. GitHub Container Registry access

### Configuration

1. The GitHub Actions workflow is defined in `.github/workflows/build-api-image.yml`
2. No additional secrets need to be configured as `GITHUB_TOKEN` is provided automatically

### Workflow Triggers

The workflow is triggered by:
- Pushes to the `main` branch that modify files in the `api/` directory
- Manual triggers via the GitHub Actions UI with environment selection

### Workflow Steps

1. Check out the repository
2. Set up Java 17
3. Build the Spring Boot application with Maven
4. Build the Docker image using `api/Dockerfile.fly`
5. Push the image to GitHub Container Registry with appropriate tags
6. Output the image reference for use in Terraform

## Setting Up Terraform

### Prerequisites

1. AWS account with Route53 access
2. Render account and API key
3. Fly.io account and API token
4. Terraform CLI installed locally (v1.0.0+)
5. AWS CLI configured with appropriate credentials

### Initial Setup

1. **Terraform State Backend Setup**:
   ```bash
   cd deploy/terraform/scripts
   ./bootstrap-terraform-backend.sh
   ```

2. **Configure Terraform Variables**:
   ```bash
   cd deploy/terraform/manifests
   cp terraform.tfvars.example terraform.tfvars
   ```

   Edit `terraform.tfvars` to include:
   - AWS region and credentials
   - Domain name
   - Render API key and settings
   - Fly.io API token and settings
   - API Docker image reference from GitHub Actions output

### Deployment

```bash
cd deploy/terraform/manifests

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Apply changes
terraform apply
```

## Managed Resources

### Fly.io Resources (via Terraform)

1. **Applications**:
   - Spring Boot API application
   - PostgreSQL database
   - RabbitMQ message broker

2. **Volumes** for persistent storage:
   - PostgreSQL data volume
   - RabbitMQ data volume

3. **Machines** to run the applications:
   - API machine with the Docker image from GitHub Container Registry
   - PostgreSQL machine
   - RabbitMQ machine

### Render Resources (via Terraform)

1. **Static Site**:
   - React frontend application
   - Configured with custom domain
   - Connected to GitHub repository for auto-deployment

### AWS Route53 Resources (via Terraform)

1. **DNS Records**:
   - A/CNAME records for the frontend application
   - A/CNAME records for the API application

## Environment Variables

### Secrets Management

Sensitive information is managed by:
1. **Terraform Variables**: For infrastructure deployment
2. **Fly.io Environment Variables**: For API runtime configuration

### API Environment Variables

The API Docker image accepts the following environment variables at runtime:

1. **Server Configuration**:
   - `SERVER_PORT`: The port the application will listen on (default: 8080)
   - `SPRING_PROFILES_ACTIVE`: The Spring profile to activate (default: prod)

2. **Database Configuration**:
   - `SPRING_DATASOURCE_URL`: JDBC URL to the PostgreSQL database
   - `SPRING_DATASOURCE_USERNAME`: Database username
   - `SPRING_DATASOURCE_PASSWORD`: Database password

3. **RabbitMQ Configuration**:
   - `SPRING_RABBITMQ_HOST`: Hostname of the RabbitMQ server
   - `SPRING_RABBITMQ_PORT`: Port of the RabbitMQ server (default: 5672)
   - `SPRING_RABBITMQ_USERNAME`: RabbitMQ username
   - `SPRING_RABBITMQ_PASSWORD`: RabbitMQ password

4. **API Configuration**:
   - `API_BASE_URL`: The base URL where the API is accessible

## Updating the Application

### Frontend Updates

1. Push changes to the GitHub repository
2. Render will automatically rebuild and deploy the frontend

### API Updates

1. Push changes to the GitHub repository
2. GitHub Actions will build and push a new Docker image
3. Update the `fly_api_image` variable in `terraform.tfvars` with the new image reference
4. Run `terraform apply` to deploy the new image

## Troubleshooting

### GitHub Actions Issues

1. **Build Failures**:
   - Check the GitHub Actions logs for Maven or Docker build errors
   - Verify that the `api/Dockerfile.fly` is correctly configured

2. **Push Failures**:
   - Verify repository permissions for GitHub Container Registry

### Terraform Issues

1. **State Management**:
   - Verify access to the S3 bucket and DynamoDB table
   - Check for state locking issues

2. **API Deployment Failures**:
   - Verify the image reference is correct
   - Check Fly.io logs with `fly logs -a meal-manager`

3. **Database Connection Issues**:
   - Verify the environment variables are correctly set
   - Check the database is running with `fly status -a meal-manager-db`

## Rollbacks

### Rolling Back API Changes

1. Update the `fly_api_image` variable to reference a previous image version
2. Run `terraform apply` to deploy the previous image

### Rolling Back Infrastructure Changes

1. Run `terraform plan -target=RESOURCE_NAME` to see the changes for a specific resource
2. Run `terraform apply -target=RESOURCE_NAME` to apply changes to only that resource

## Security Considerations

1. Sensitive information is never stored in the Docker image
2. All secrets are provided at runtime via environment variables
3. The API runs as a non-root user in the container
4. HTTPS is enforced for all traffic