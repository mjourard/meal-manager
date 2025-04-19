# Get Terraform Version GitHub Action

This GitHub Action extracts the Terraform version from a specified manifest file. It is designed to be used across multiple workflows to ensure consistent Terraform version usage throughout the CI/CD pipeline.

## Usage

```yaml
- name: Get Terraform version
  id: get_tf_version
  uses: ./.github/actions/get-terraform-version
  with:
    manifest_path: deploy/terraform/manifests/dns/providers.tf

- name: Setup Terraform
  uses: hashicorp/setup-terraform@v3
  with:
    terraform_version: ${{ steps.get_tf_version.outputs.terraform_version }}
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `manifest_path` | Path to the Terraform manifest file containing required_version | Yes | `deploy/terraform/manifests/dns/providers.tf` |

## Outputs

| Output | Description |
|--------|-------------|
| `terraform_version` | The extracted Terraform version |

## How it works

The action uses grep to extract the Terraform version from the specified manifest file. It looks for the `required_version` field and extracts the version number.

For example, if your manifest file contains:

```hcl
terraform {
  required_version = ">= 1.11.0"
  
  # Other terraform configuration
}
```

The action will extract `1.11.0` and provide it as an output. 