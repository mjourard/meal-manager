# Reference existing Route 53 hosted zone
data "aws_route53_zone" "main" {
  name = var.domain_name
} 