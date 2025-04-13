terraform {
  backend "s3" {
    bucket         = "terraform-state-files-us-east-1-993881575707"
    key            = "meal-manager/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-locks-us-east-1-993881575707"
  }
} 