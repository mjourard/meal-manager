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
      value = "https://api.${var.domain_name}"
    }
    VITE_CLERK_PUBLISHABLE_KEY = {
      value = var.clerk_config.publishable_key
    }
    VITE_CLERK_SIGN_IN_URL = {
      value = var.clerk_config.sign_in_url
    }
    VITE_CLERK_SIGN_UP_URL = {
      value = var.clerk_config.sign_up_url
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

# DNS records for Clerk authentication
resource "aws_route53_record" "clerk_main" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "clerk"
  type    = "CNAME"
  ttl     = 300
  records = [var.clerk_config.cname_clerk]
}

resource "aws_route53_record" "clerk_accounts" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "accounts"
  type    = "CNAME"
  ttl     = 300
  records = [var.clerk_config.cname_accounts]
}

resource "aws_route53_record" "clerk_email" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "clk._domainkey"
  type    = "CNAME"
  ttl     = 300
  records = [var.clerk_config.cname_email_clk]
}

resource "aws_route53_record" "clerk_email2" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "clk2._domainkey"
  type    = "CNAME"
  ttl     = 300
  records = [var.clerk_config.cname_email_clk2]
}

resource "aws_route53_record" "clerk_email_mail" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "clkmail"
  type    = "CNAME"
  ttl     = 300
  records = [var.clerk_config.cname_email_clkmail]
}
