#!/bin/bash

# Install the test dependencies (verdaccio, vitest) using the versions
# pinned in the root package.json, without installing the whole workspace.
# Used by the test-* CI jobs, which run with `install: false`.

set -euo pipefail

PACKAGES="verdaccio vitest"
SPECS=""

for PACKAGE in $PACKAGES; do
  VERSION=$(npm pkg get "devDependencies.$PACKAGE" | tr -d '"')

  if [ -z "$VERSION" ] || [ "$VERSION" = "{}" ]; then
    echo "Could not find '$PACKAGE' in devDependencies" >&2
    exit 1
  fi

  echo "Resolved $PACKAGE@$VERSION"
  SPECS="$SPECS $PACKAGE@$VERSION"
done

echo "Installing:$SPECS"
npm install --global $SPECS
