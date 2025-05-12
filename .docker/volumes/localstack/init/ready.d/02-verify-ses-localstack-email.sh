#!/bin/bash
set -eo pipefail

## This file needs to be mounted in the container for it to run on startup.
## See https://docs.localstack.cloud/references/init-hooks/ for details

for EMAIL_ADDRESS in $(echo $LOCALSTACK_SES_VERIFIED_EMAIL_ADDRESSES | sed "s/,/ /g")
do
  echo 'Running AWS verify identity command. See: https://github.com/localstack/localstack/issues/339'
  aws ses verify-email-identity --email-address ${EMAIL_ADDRESS} --region ${AWS_REGION} --endpoint-url=http://localhost:4566
  echo "Verified ${EMAIL_ADDRESS}"
done