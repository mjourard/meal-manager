# Meal Manager Infrastructure Deployment

This directory contains Terraform configurations to deploy the Meal Manager application infrastructure.

## Architecture

The infrastructure is deployed across multiple cloud providers to optimize for cost and simplicity:

- **Frontend**: Static site hosting on Render (free tier)
- **Backend**: Java Spring Boot API on Railway (free tier with usage limits)
- **Database**: PostgreSQL on Railway (free tier with usage limits)
- **DNS**: AWS Route53 for domain management

For a visual representation of the architecture, see [the architecture diagram](manifests/architecture.md).

## Prerequisites

Before you begin, you'll need:

1. An AWS account with access to Route53
2. A Render account and API key
3. A Railway account
4. Terraform CLI installed locally (v1.0.0+)
5. AWS CLI configured with appropriate credentials

## Initial Setup

### 1. Set up Terraform State Backend

First, create the S3 bucket and DynamoDB table for Terraform state management:

```bash
# Execute the bootstrap script
cd deploy/terraform/scripts
./bootstrap-terraform-backend.sh
```

### 2. Deploy Railway Resources Manually

Since Railway doesn't have a Terraform provider, you'll need to deploy these resources manually:

1. Create a new Railway project
2. Add a PostgreSQL database
3. Configure a new service for the Spring Boot API
   - Connect your GitHub repository
   - Set required environment variables:
     - `SPRING_PROFILES_ACTIVE=prod`
     - `SPRING_DATASOURCE_URL` (should be auto-configured by Railway)
     - `SPRING_DATASOURCE_USERNAME` (should be auto-configured by Railway)
     - `SPRING_DATASOURCE_PASSWORD` (should be auto-configured by Railway)
4. Deploy the service
5. Note the generated domain (e.g., `meal-manager-api.up.railway.app`)

### 3. Configure Terraform Variables

```bash
# Copy the example variables file
cd deploy/terraform/manifests
cp terraform.tfvars.example terraform.tfvars

# Edit the file with your specific values
vim terraform.tfvars
```

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
3. Configure custom domains in Railway to match your Route53 records

## Maintenance

### Updating the Deployment

When you make changes to the application:

```bash
# Update just the Terraform-managed resources
cd deploy/terraform/manifests
terraform apply

# Railway resources will auto-deploy on git push if configured for CI/CD
```

### Monitoring Costs

Monitor your usage to avoid exceeding free tiers:

1. Railway dashboard for API and database usage
2. Render dashboard for frontend usage
3. AWS Billing dashboard for Route53 charges

## Cleaning Up

To destroy all resources when they're no longer needed:

```bash
# Remove Terraform-managed resources
cd deploy/terraform/manifests
terraform destroy

# Manually delete Railway resources through their UI
```

## Troubleshooting

Common issues and solutions:

1. **DNS not resolving**: Check that your Route53 records are correctly pointing to your service domains
2. **Railway deployment failures**: Check logs in the Railway dashboard
3. **Terraform state issues**: Ensure your S3 bucket and DynamoDB table are correctly configured

For more detailed debugging information, see the [DEBUGGING.md](../../DEBUGGING.md) file in the repository root. 