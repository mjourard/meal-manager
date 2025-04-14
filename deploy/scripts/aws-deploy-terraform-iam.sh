#!/bin/bash

set -e

# Set variables
STACK_NAME="meal-manager-terraform-deployer"
TEMPLATE_PATH="../terraform/cloudformation/terraform-deployer.yaml"
OUTPUT_FILE="./terraform-iam-credentials.txt"
REGION=${AWS_REGION:-"us-east-1"}

# Determine developer name from env var or whoami
if [ -z "${DEVELOPER}" ]; then
  DEVELOPER=$(whoami)
fi

# Get Git information
GIT_COMMIT_HASH=$(git rev-parse HEAD)
GIT_BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)

echo "================================================================="
echo "Deploying Terraform IAM CloudFormation stack"
echo "================================================================="
echo "Developer: ${DEVELOPER}"
echo "Git Commit: ${GIT_COMMIT_HASH}"
echo "Git Branch: ${GIT_BRANCH_NAME}"
echo "Region: ${REGION}"
echo "================================================================="

# Create the stack
aws cloudformation deploy \
  --template-file "${TEMPLATE_PATH}" \
  --stack-name "${STACK_NAME}" \
  --tags \
    DEVELOPER="${DEVELOPER}" \
    GitCommitHash="${GIT_COMMIT_HASH}" \
    GitBranchName="${GIT_BRANCH_NAME}" \
    Purpose="Terraform Deployment" \
  --capabilities CAPABILITY_NAMED_IAM \
  --region "${REGION}"

# Get stack outputs
echo "Getting stack outputs..."
ACCESS_KEY_ID=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --query "Stacks[0].Outputs[?ExportName=='${STACK_NAME}-AccessKeyId'].OutputValue" \
  --output text \
  --region "${REGION}")

SECRET_ACCESS_KEY=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --query "Stacks[0].Outputs[?ExportName=='${STACK_NAME}-SecretAccessKey'].OutputValue" \
  --output text \
  --region "${REGION}")

USER_ARN=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --query "Stacks[0].Outputs[?ExportName=='${STACK_NAME}-UserARN'].OutputValue" \
  --output text \
  --region "${REGION}")

# Save credentials to file
echo "Saving credentials to ${OUTPUT_FILE}..."
cat > "${OUTPUT_FILE}" << EOF
# Terraform IAM User Credentials
# Generated on: $(date)
# Stack Name: ${STACK_NAME}
# Developer: ${DEVELOPER}
# Git Commit: ${GIT_COMMIT_HASH}
# Git Branch: ${GIT_BRANCH_NAME}

export AWS_ACCESS_KEY_ID=${ACCESS_KEY_ID}
export AWS_SECRET_ACCESS_KEY=${SECRET_ACCESS_KEY}
export AWS_DEFAULT_REGION=${REGION}

# Terraform Variables
# Use these in your terraform.tfvars file
aws_access_key = "${ACCESS_KEY_ID}"
aws_secret_key = "${SECRET_ACCESS_KEY}"
aws_region = "${REGION}"
EOF

chmod 600 "${OUTPUT_FILE}"

# Tag the IAM user directly for additional visibility
aws iam tag-user \
  --user-name terraform-deployer \
  --tags \
    Key=DEVELOPER,Value="${DEVELOPER}" \
    Key=GitCommitHash,Value="${GIT_COMMIT_HASH}" \
    Key=GitBranchName,Value="${GIT_BRANCH_NAME}" \
    Key=Purpose,Value="Terraform Deployment" \
  --region "${REGION}"

echo "================================================================="
echo "CloudFormation stack '${STACK_NAME}' deployed successfully!"
echo "================================================================="
echo "IAM User ARN: ${USER_ARN}"
echo "Credentials saved to: ${OUTPUT_FILE}"
echo ""
echo "To use these credentials for Terraform:"
echo "  source ${OUTPUT_FILE}"
echo ""
echo "IMPORTANT: Keep these credentials secure and never commit them to version control!"
echo "=================================================================" 