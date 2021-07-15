#!/usr/bin/env bash

echo "This script assumes that the session running it is authenticated to push to the docker container registry used here."

ROOT_DIR=$(cd `dirname $0` && cd .. && pwd)
echo "Building from $ROOT_DIR as the root directory"
Dockerfile="$ROOT_DIR/.docker/api.prod.dockerfile"

# name of the docker image
DOCKER_NAME="mjourard/mealmanager-api"
echo "Building docker image with name '$DOCKER_NAME'"

# get the new version of the jar and copy it to the prod jar
# this part probably isn't necessary based on how the dockerfile is being constructed
VERSION=0.0.1-SNAPSHOT
echo "Found api version $VERSION"

# build the api dockerfile
echo "Building the api dockerfile"
pushd $ROOT_DIR
docker build --no-cache -f $Dockerfile -t $DOCKER_NAME:$VERSION -t $DOCKER_NAME:latest .
docker push $DOCKER_NAME:$VERSION
docker push $DOCKER_NAME:latest
popd

# this isn't very dry, but we shouldn't need more than 2 images for this project so I won't grab this into a function
# build the client dockerfile
echo "Building the client dockerfile"
Dockerfile="$ROOT_DIR/.docker/client.prod.dockerfile"
DOCKER_NAME="mjourard/mealmanager-client"
pushd $ROOT_DIR
docker build --no-cache -f $Dockerfile -t $DOCKER_NAME:$VERSION -t $DOCKER_NAME:latest .
docker push $DOCKER_NAME:$VERSION
docker push $DOCKER_NAME:latest
popd

