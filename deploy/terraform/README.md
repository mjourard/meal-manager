# Meal Manager Infrastructure Deployment

This directory contains Terraform configurations to deploy the Meal Manager application infrastructure.

## Architecture

The infrastructure is deployed across multiple cloud providers to optimize for cost and simplicity:

- **Frontend**: Static site hosting on Render (free tier)
- **Backend**: Spring Boot API deployed to Fly.io (free tier with generous limits)
- **Database**: PostgreSQL on Fly.io (shared CPU instances with volumes)
- **Message Broker**: RabbitMQ on Fly.io
- **DNS**: AWS Route53 for domain management

For a visual representation of the architecture, see [the architecture diagram](manifests/architecture.md).

## Deployment Process Overview

The deployment process follows these steps:

1. **Build & Push API Docker Image**: This is done via GitHub Actions workflow
2. **Deploy Infrastructure**: This is done via Terraform, which manages all cloud resources

This separation allows for secure handling of secrets and a cleaner deployment workflow.

## Prerequisites

Before you begin, you'll need:

1. An AWS account with access to Route53
2. A Render account and API key
3. A Fly.io account
4. Terraform CLI installed locally (v1.0.0+)
5. AWS CLI configured with appropriate credentials
6. GitHub repository with GitHub Actions enabled

## Initial Setup

### 1. Set up Terraform State Backend

First, create the S3 bucket and DynamoDB table for Terraform state management:

```bash
# Execute the bootstrap script
cd deploy/terraform/scripts
./bootstrap-terraform-backend.sh
```

### 2. Build and Push the API Docker Image

The Docker image for the API is built and pushed to GitHub Container Registry using GitHub Actions:

1. Set up the required GitHub repository secrets:
   - `GITHUB_TOKEN` (automatically provided)

2. Trigger the GitHub Actions workflow:
   - Push to the main branch, or
   - Manually trigger the workflow from the GitHub Actions tab

3. The workflow will:
   - Build the Spring Boot application
   - Create a Docker image using the Dockerfile.fly in the api directory
   - Push the image to GitHub Container Registry with appropriate tags
   - Output the full image reference to use in Terraform

### 3. Configure Terraform Variables

```bash
# Copy the example variables file
cd deploy/terraform/manifests
cp terraform.tfvars.example terraform.tfvars

# Edit the file with your specific values
vim terraform.tfvars
```

Important: Update the `fly_api_image` variable with the full image reference from the GitHub Actions workflow output.

### 4. Render Custom Domain Configuration

The Terraform configuration automatically sets up:
- A custom domain in Render via the `custom_domains` attribute
- A CNAME record in Route53 pointing to the Render default domain

Note that you'll need to verify domain ownership according to Render's requirements, which typically involves:
1. Adding a verification TXT record to your DNS (Render will provide the details)
2. Confirming ownership through the Render dashboard

## Deployment

```bash
cd deploy/terraform/manifests

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Apply changes
terraform apply
```

## Post-Deployment

After successful deployment:

1. Verify the frontend is accessible at `https://app.yourdomain.com`
2. Verify the API is accessible at `https://api.yourdomain.com`
3. Configure custom domains in Fly.io to match your Route53 records

## Maintenance

### Updating the Deployment

When you make changes to the application:

1. For frontend updates (Render):
   ```bash
   cd deploy/terraform/manifests
   terraform apply
   ```

2. For API updates:
   - Push changes to GitHub to trigger the build workflow
   - Update the `fly_api_image` variable in terraform.tfvars with the new image reference
   - Run `terraform apply` to deploy the new image

### Monitoring Costs

Monitor your usage to avoid exceeding free tiers:

1. Fly.io dashboard for API, PostgreSQL, and RabbitMQ usage
2. Render dashboard for frontend usage
3. AWS Billing dashboard for Route53 charges

## Cleaning Up

To destroy all resources when they're no longer needed:

```bash
# Remove Terraform-managed resources
cd deploy/terraform/manifests
terraform destroy

# Delete container images from GitHub Container Registry if needed
# (manual process through GitHub interface)
```

## Troubleshooting

Common issues and solutions:

1. **DNS not resolving**: Check that your Route53 records are correctly pointing to your service domains
2. **Fly.io deployment failures**: Check logs with `fly logs`
3. **Terraform state issues**: Ensure your S3 bucket and DynamoDB table are correctly configured
4. **Render custom domain issues**: Check the verification status in the Render dashboard and make sure DNS propagation has completed
5. **Docker image issues**: Check the GitHub Actions workflow runs for any build or push errors

For more detailed debugging information, see the [DEBUGGING.md](../../DEBUGGING.md) file in the repository root. 