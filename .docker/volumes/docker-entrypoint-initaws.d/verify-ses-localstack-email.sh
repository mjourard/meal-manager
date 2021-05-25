#!/bin/bash
set -eo pipefail

## Mount this file in /docker-entrypoint-initaws.d so that localstack runs it
## as part of its entrypoint routine.

for EMAIL_ADDRESS in $(echo $LOCALSTACK_SES_VERIFIED_EMAIL_ADDRESSES | sed "s/,/ /g")
do
  echo 'Running AWS verify identity command. See: https://github.com/localstack/localstack/issues/339'
  aws ses verify-email-identity --email-address ${EMAIL_ADDRESS} --region ${AWS_REGION} --endpoint-url=http://localhost:4566
  echo "Verified ${EMAIL_ADDRESS}"
done