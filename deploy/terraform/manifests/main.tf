terraform {
  required_version = ">= 1.0.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    render = {
      source  = "render-oss/render"
      version = "~> 1.1.0"
    }
  }
  
  backend "s3" {
    bucket         = "meal-manager-terraform-state"
    key            = "meal-manager/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "meal-manager-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "meal-manager"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

provider "render" {
  api_key = var.render_api_key
}

# Reference existing Route 53 hosted zone
data "aws_route53_zone" "main" {
  name = var.domain_name
}

# Render static site for React frontend
resource "render_static_site" "frontend" {
  name       = "meal-manager-frontend"
  owner_name = var.render_team_name
  repo_url   = var.repository_url
  branch     = var.repository_branch
  
  build_command     = "cd client && npm install && npm run build"
  publish_directory = "client/dist"
  
  environment_variables = {
    VITE_API_BASE_URL = "https://api.${var.domain_name}/api"
  }
}

# DNS record for frontend
resource "aws_route53_record" "frontend" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "app.${var.domain_name}"
  type    = "CNAME"
  ttl     = 300
  records = [render_static_site.frontend.default_domain]
}

# DNS record for API (Railway - manually configured)
resource "aws_route53_record" "api" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "api.${var.domain_name}"
  type    = "CNAME"
  ttl     = 300
  records = [var.railway_app_domain]
}

# Output important information
output "frontend_url" {
  value       = "https://app.${var.domain_name}"
  description = "The URL of the frontend application"
}

output "api_url" {
  value       = "https://api.${var.domain_name}"
  description = "The URL of the API"
}

output "render_site_url" {
  value       = render_static_site.frontend.url
  description = "The original Render URL of the frontend"
} 