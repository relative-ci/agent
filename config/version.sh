#!/bin/bash

BRANCH=$(git rev-parse --abbrev-ref HEAD)
PRERELEASE_ARG=""

# IF diff than master, release beta
if [ "$BRANCH" != "master" ]
then
	PRERELEASE_ARG="--config ./config/version-beta.js --preRelease=beta"
else
  PRERELEASE_ARG="--config ./config/version-stable.js"
fi

RELEASE_ARGS="${PRERELEASE_ARG} ${@}"

echo "Running release-it with '${RELEASE_ARGS}'."

npx release-it $RELEASE_ARGS
