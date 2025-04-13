variable "aws_region" {
  description = "The AWS region to deploy resources to"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "The deployment environment (dev or prod)"
  type        = string
  default     = "prod"
  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "Environment must be either 'dev' or 'prod'."
  }
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

variable "render_owner_id" {
  description = "The owner ID for Render. All resources will be created under this owner ID."
  type        = string
  # This should be set in your terraform.tfvars file or as an environment variable
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

variable "fly_app_name" {
  description = "The name of the Fly.io app"
  type        = string
  default     = "meal-manager"
}

variable "clerk_config" {
  description = "The Clerk publishable key"
  type        = object({
    publishable_key = string
    cname_clerk = string
    cname_accounts = string
    cname_email_clk = string
    cname_email_clk2 = string
    cname_email_clkmail = string
    sign_in_url = string
    sign_up_url = string
  })
}
