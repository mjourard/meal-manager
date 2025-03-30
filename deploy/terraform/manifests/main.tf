# Render static site for React frontend
resource "render_static_site" "frontend" {
  name          = "meal-manager-frontend"
  repo_url      = var.repository_url
  build_command = "cd client && npm install && npm run build"
  
  branch       = var.repository_branch
  publish_path = "client/dist"
  
  env_vars = {
    VITE_API_BASE_URL = {
      value = "https://api.${var.domain_name}/api"
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
  records = [render_static_site.frontend.default_domain]
}

# DNS record for API on Fly.io
resource "aws_route53_record" "api" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "api.${var.domain_name}"
  type    = "CNAME"
  ttl     = 300
  records = ["${var.fly_app_name}.fly.dev"]
} 