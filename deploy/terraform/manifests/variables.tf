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

# Fly.io specific variables
variable "fly_api_token" {
  description = "API token for Fly.io"
  type        = string
  sensitive   = true
  # This should be set in your terraform.tfvars file or as an environment variable
}

variable "fly_org" {
  description = "The organization name on Fly.io"
  type        = string
  default     = "personal"
}

variable "fly_region" {
  description = "The primary region to deploy Fly.io applications"
  type        = string
  default     = "yul" # Montreal, Ontario, Canada
}

variable "fly_app_name" {
  description = "The name of the main application on Fly.io"
  type        = string
  default     = "meal-manager"
}

variable "fly_db_name" {
  description = "The name of the PostgreSQL database on Fly.io"
  type        = string
  default     = "meal-manager-db"
}

variable "fly_rabbitmq_name" {
  description = "The name of the RabbitMQ instance on Fly.io"
  type        = string
  default     = "meal-manager-mq"
}

variable "fly_api_image" {
  description = "The Docker image for the API (e.g., username/repo:tag)"
  type        = string
  default     = "meal-manager-api:latest"
}

variable "postgres_password" {
  description = "Password for the PostgreSQL database"
  type        = string
  sensitive   = true
  # This should be set in your terraform.tfvars file
} 