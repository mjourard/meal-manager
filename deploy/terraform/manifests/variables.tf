variable "aws_region" {
  description = "The AWS region to deploy resources to"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "The deployment environment (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "domain_name" {
  description = "The root domain name for the application"
  type        = string
  # This should be set in your terraform.tfvars file
  # Example: yourdomain.com
}

variable "render_api_key" {
  description = "API key for Render"
  type        = string
  sensitive   = true
  # This should be set in your terraform.tfvars file or as an environment variable
}

variable "render_team_name" {
  description = "The name of your Render team"
  type        = string
  # This should be set in your terraform.tfvars file
}

variable "repository_url" {
  description = "URL of the Git repository"
  type        = string
  default     = "https://github.com/mjourard/meal-manager"
}

variable "repository_branch" {
  description = "Branch of the Git repository to deploy"
  type        = string
  default     = "main"
}

variable "railway_app_domain" {
  description = "The domain of your Railway app (e.g., your-app.up.railway.app)"
  type        = string
  # This should be set in your terraform.tfvars file after manually deploying to Railway
} 