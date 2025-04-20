# Terraform Environment Setup Action

This GitHub Action copies environment-specific Terraform variable files from a source directory to a target manifest directory. It's designed to be used in CI/CD pipelines to prepare the correct environment configuration before applying Terraform changes.

## Purpose

When deploying infrastructure to different environments (dev, test, production), you often need different variables for each environment. This action simplifies the process by automatically copying the right files based on the current deployment environment.

## Directory Structure

The action expects a directory structure like:

```
deploy/
  terraform/
    environments/
      dev/
        env.auto.tfvars
      test/
        env.auto.tfvars
      production/
        env.auto.tfvars
    manifests/
      dns/
        # Terraform files here
```

## Usage

```yaml
- name: Setup Terraform environment files
  uses: ./.github/actions/terraform-env-setup
  with:
    environment: ${{ env.DEPLOY_ENV }}  # or directly: production, dev, etc.
  env:
    TF_VAR_render_api_key: ${{ secrets.TF_VAR_render_api_key }}
    # Add any other sensitive variables here
```

## Handling Secrets

This action creates a `secrets.auto.tfvars` file that includes sensitive variables from GitHub environment secrets. 
Any environment variable starting with `TF_VAR_` will be processed by Terraform automatically.

To use secrets in your Terraform configuration:

1. Store your secrets in GitHub environment secrets with the `TF_VAR_` prefix (e.g., `TF_VAR_render_api_key`)
2. Pass these secrets to the action as environment variables
3. Reference them in your Terraform code as normal variables (e.g., `render_api_key`)

Example workflow step:

```yaml
- name: Setup Terraform environment files
  uses: ./.github/actions/terraform-env-setup
  with:
    environment: production
  env:
    TF_VAR_render_api_key: ${{ secrets.TF_VAR_render_api_key }}
    TF_VAR_another_secret: ${{ secrets.TF_VAR_another_secret }}
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `environment` | The deployment environment (dev, test, production, etc.) | Yes | |
| `source_dir` | The source directory containing environment-specific files | No | `deploy/terraform/environments` |
| `target_dir` | The target manifest directory | No | `deploy/terraform/manifests/dns` |
| `file_pattern` | The file pattern to copy | No | `*.auto.tfvars` |

## Example - Full Configuration

```yaml
- name: Setup Terraform environment files
  uses: ./.github/actions/terraform-env-setup
  with:
    environment: production
    source_dir: deploy/terraform/environments
    target_dir: deploy/terraform/manifests/dns
    file_pattern: '*.auto.tfvars'
```

## Features

- Validates that the environment directory exists before attempting to copy
- Creates the target directory if it doesn't exist
- Provides informative logs about the copy operation
- Shows warnings if no matching files are found
- Lists the files in the target directory after copying for verification 