#!/bin/bash

LOCAL_REGISTRY="http://localhost:4873"
LOCAL_REGISTRY_AUTH="//localhost:4873/:_authToken=foobar" # Add a non empty auth token for npm +6

cleanup() {
  echo "Reverting .npmrc changes"
  mv .npmrc.bak .npmrc
}

trap cleanup EXIT

echo "Setup .npmrc"
cp .npmrc .npmrc.bak
npm config set registry=$LOCAL_REGISTRY --location project
npm config set $LOCAL_REGISTRY_AUTH --location project

echo "Run local registry"
npx verdaccio --config ./verdaccio.yaml
