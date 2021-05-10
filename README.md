# Meal Manager

A Web app for managing the meals we eat as a house hold 

## Demo

Coming soon

## Startup Instructions

Requires docker, mvn, yarn and npm
Instructions:
```
pushd .docker
docker-compose up
popd
pushd api
./mvnw spring-boot:run
popd
pushd client
yarn install
npm run start
```

And you're good to go

## Implementation Plan:
[] Part 1: Database of meals we can choose from. Create screen that allow you to select a list of meals and email the list out to list of emails 

[] Part 2: Create screen for adding meals. Include ability to add links to recipe

[] Part 3: Add tags to the recipe list. Add ability to rate past recipes

[] Part 4: Add a cron job for downloading recipe pages so they are archived

[] Part 5: Add GotMilk Integration, save grocery lists to DB and sync to GotMilk