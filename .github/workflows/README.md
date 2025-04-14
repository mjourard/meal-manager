# MealManager CICD

This document outlines the intention of MealManager's CICD workflows.

On each commit, it should run the linters configured for each of the following folders of code:
* api
* client
* deploy/terraform

and if any of the linters report failures, the build should fail and exit as normal. 

On each commit to the main branch, it should do the following:
1. Run all available tests, if there are any. Failures should halt the build from deploying.
2. if there were any changes to the `api` directory, run the `fly-deploy.sh` script in the deploy/scripts folder
3. if there were any changes in the `deploy/terraform` directory, then `terraform apply` should be run

The above rules should also be available to be followed through a 'manually triggered' workflow as well. 
They should reuse the same workflow as much as possible to promote DRY workflow file definitions.

Assume that there will be an environment called 'production' that will store secrets, but the only secrets being stored will be things like client ids, client secrets and API keys. Assume all other configuration values will be checked in through files.