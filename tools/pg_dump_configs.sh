#!/usr/bin/bash

# A script to dump the current database using pg_dump.
# Intended to be used to help developing migration scripts with flyway after creating new tables with hibernate.


# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# configuration info
FILENAME="$SCRIPT_DIR/mm_db_dump_$(date +%Y%m%d%H%M%S).sql"
DB_HOST="db.mealmanager"
DB_PORT="5432"
DB_NAME="compose-postgres"
DB_USERNAME="compose-postgres"


pg_dump --file="$FILENAME" \
    --verbose \
    --create \
    --format=p \
    --no-owner \
    --dbname="$DB_NAME" \
    -h "$DB_HOST" -p "$DB_PORT" \
    -U "$DB_USERNAME"

echo "Dumped to $FILENAME"