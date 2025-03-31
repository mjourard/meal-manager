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

# Fly.io outputs
output "fly_api_url" {
  value       = "https://${var.fly_app_name}.fly.dev"
  description = "The URL of the API on Fly.io"
}

output "fly_postgres_url" {
  value       = "postgres://mealmanager:${var.postgres_password}@${var.fly_db_name}.internal:5432/mealmanager"
  description = "The internal PostgreSQL connection string (only accessible within Fly.io network)"
  sensitive   = true
}

output "fly_rabbitmq_url" {
  value       = "amqp://mealmanager:${var.postgres_password}@${var.fly_rabbitmq_name}.internal:5672"
  description = "The internal RabbitMQ connection string (only accessible within Fly.io network)"
  sensitive   = true
}

output "fly_rabbitmq_admin_url" {
  value       = "https://${var.fly_rabbitmq_name}.fly.dev:15672"
  description = "The RabbitMQ management interface URL"
} 