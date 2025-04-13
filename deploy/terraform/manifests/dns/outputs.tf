# Output important information
output "frontend_url" {
  value       = "https://app.${var.domain_name}"
  description = "The URL of the frontend application"
}

output "render_site" {
  value     = render_static_site.frontend.custom_domains.*
}

output "api_url" {
  value       = "https://api.${var.domain_name}"
  description = "The URL of the API"
}

output "render_site_url" {
  value       = render_static_site.frontend.url
  description = "The original Render URL of the frontend"
}

# Fly.io outputs
output "fly_api_url" {
  value       = "https://${var.fly_app_name}.fly.dev"
  description = "The URL of the API on Fly.io"
}

