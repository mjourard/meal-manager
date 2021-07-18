# Meal Manager

A Web app for managing the meals we eat as a household. 

## Demo

Coming soon

## Startup Instructions

Requires docker, mvn and npm

Instructions:
1. Create a new `.env` file in the `env-files` directory of this repo, and fill out the AWS credentials required for an SES user, as well as an SES-verified email address.
2. Follow these instructions to start up a prod-like build. This will pull down the current docker images from dockerhub: 
```
pushd .docker
docker-compose -f docker-compose.prod.yml --env-file ../env-files/.env up
```

And you're good to go

## Implementation Plan:
Check [the project page](https://github.com/mjourard/meal-manager/projects/1) for the most up-to-date implementation plan.

[x] v0.0.1: Database of meals we can choose from. Create screen that allow you to select a list of meals and email the list out to list of emails 

[x] v0.0.1: Create screen for adding meals. Include ability to add links to recipe

[] v1.0.0: Add tags to the recipe list. Add ability to rate past recipes

[] v1.1.0: Add a cron job for downloading recipe pages so they are archived

[] v1.2.0: Add GotMilk Integration, save grocery lists to DB and sync to GotMilk

 