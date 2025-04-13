# Render static site for React frontend
locals {
  render_frontend_name = "meal-manager-frontend"
}

resource "render_static_site" "frontend" {
  name           = local.render_frontend_name
  repo_url       = var.repository_url
  root_directory = "client"
  build_command  = "npm install && npm run build"

  branch       = var.repository_branch
  publish_path = "dist"


  env_vars = {
    VITE_MEALMANAGER_BASE_URL = {
      value = "https://api.${var.domain_name}/api"
    }
    VITE_CLERK_PUBLISHABLE_KEY = {
      value = var.clerk_publishable_key
    }
  }

  custom_domains = [
    { name = "app.${var.domain_name}" }
  ]
}

# DNS record for frontend
# Note: Even though Render handles custom domains internally, we still need to create a 
# CNAME record in Route53 pointing to the Render default domain
resource "aws_route53_record" "frontend" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "app.${var.domain_name}"
  type    = "CNAME"
  ttl     = 300
  records = ["${local.render_frontend_name}.onrender.com"]
}

# DNS record for API on Fly.io
resource "aws_route53_record" "api" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "api.${var.domain_name}"
  type    = "CNAME"
  ttl     = 300
  records = ["${var.fly_app_name}.fly.dev"]
} 