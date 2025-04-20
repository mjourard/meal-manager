# Sample terraform.tfvars file
# Copy this file to terraform.tfvars and fill in your values

# AWS Configuration
aws_region  = "us-east-1"
environment = "production"

# Domain Configuration
domain_name = "mealmanager.org" # Replace with your actual domain

fly_app_name = "meal-manager"


# Git Repository - Update if you've forked the repository
repository_url    = "https://github.com/mjourard/meal-manager"
repository_branch = "main" # Change if deploying from a different branch 

### Secrets to move out to environment variables
# Render Configuration
# render_api_key  = "" # Replace with your Render API key
render_owner_id = "tea-cvkrj99r0fns73867d00"

# Clerk Configuration
clerk_config = {
  publishable_key     = "pk_live_Y2xlcmsubWVhbG1hbmFnZXIub3JnJA"
  cname_clerk         = "frontend-api.clerk.services"
  cname_accounts      = "accounts.clerk.services"
  cname_email_clk     = "dkim1.g7uk9wvxklct.clerk.services"
  cname_email_clk2    = "dkim2.g7uk9wvxklct.clerk.services"
  cname_email_clkmail = "mail.g7uk9wvxklct.clerk.services"
  sign_in_url         = "https://accounts.mealmanager.org/sign-in"
  sign_up_url         = "https://accounts.mealmanager.org/sign-up"
}