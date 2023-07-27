#!/bin/bash

TAG=$(git describe --tags --abbrev=0)
VERSION=${TAG:1}


NPM_CONFIG_PROVENANCE=true npx release-it $VERSION --config ./config/release-it-publish.js --ci -VV
