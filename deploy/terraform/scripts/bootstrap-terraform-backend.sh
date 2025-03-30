#!/bin/bash
# Script to bootstrap Terraform backend resources in AWS
# Creates an S3 bucket and DynamoDB table for state management

set -e

# Configuration - change these values as needed
AWS_REGION="us-east-1"
STATE_BUCKET="meal-manager-terraform-state"
LOCK_TABLE="meal-manager-terraform-locks"
PROJECT="meal-manager"

echo "Creating Terraform backend resources for $PROJECT..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
  echo "ERROR: AWS CLI is not configured. Please run 'aws configure' first."
  exit 1
fi

# Create S3 bucket if it doesn't exist
if ! aws s3api head-bucket --bucket "$STATE_BUCKET" 2>/dev/null; then
  echo "Creating S3 bucket: $STATE_BUCKET"
  aws s3api create-bucket \
    --bucket "$STATE_BUCKET" \
    --region "$AWS_REGION" \
    $(if [[ "$AWS_REGION" != "us-east-1" ]]; then echo "--create-bucket-configuration LocationConstraint=$AWS_REGION"; fi)
  
  # Enable versioning
  echo "Enabling bucket versioning"
  aws s3api put-bucket-versioning \
    --bucket "$STATE_BUCKET" \
    --versioning-configuration Status=Enabled
  
  # Enable encryption
  echo "Enabling default encryption"
  aws s3api put-bucket-encryption \
    --bucket "$STATE_BUCKET" \
    --server-side-encryption-configuration '{
      "Rules": [{
        "ApplyServerSideEncryptionByDefault": {
          "SSEAlgorithm": "AES256"
        }
      }]
    }'
  
  # Block public access
  echo "Blocking public access"
  aws s3api put-public-access-block \
    --bucket "$STATE_BUCKET" \
    --public-access-block-configuration '{
      "BlockPublicAcls": true,
      "IgnorePublicAcls": true,
      "BlockPublicPolicy": true,
      "RestrictPublicBuckets": true
    }'
else
  echo "S3 bucket already exists: $STATE_BUCKET"
fi

# Create DynamoDB table if it doesn't exist
if ! aws dynamodb describe-table --table-name "$LOCK_TABLE" 2>/dev/null; then
  echo "Creating DynamoDB table: $LOCK_TABLE"
  aws dynamodb create-table \
    --table-name "$LOCK_TABLE" \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --tags Key=Project,Value="$PROJECT" \
    --region "$AWS_REGION"
  
  # Wait for table creation
  echo "Waiting for DynamoDB table to be created..."
  aws dynamodb wait table-exists \
    --table-name "$LOCK_TABLE" \
    --region "$AWS_REGION"
else
  echo "DynamoDB table already exists: $LOCK_TABLE"
fi

echo ""
echo "Terraform backend resources are ready!"
echo ""
echo "Add the following to your Terraform configuration:"
echo ""
echo 'terraform {'
echo '  backend "s3" {'
echo '    bucket         = "'"$STATE_BUCKET"'"'
echo '    key            = "meal-manager/terraform.tfstate"'
echo '    region         = "'"$AWS_REGION"'"'
echo '    encrypt        = true'
echo '    dynamodb_table = "'"$LOCK_TABLE"'"'
echo '  }'
echo '}' 