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
    fly = {
      source  = "fly-apps/fly"
      version = "~> 0.0.23"
    }
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

provider "fly" {
  fly_api_token = var.fly_api_token
  useinternaltunnel = true
} 