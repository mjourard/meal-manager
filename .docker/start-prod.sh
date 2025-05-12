#!/usr/bin/env bash

docker compose -f docker-compose.prod.yml --env-file ../env-files/.env up

