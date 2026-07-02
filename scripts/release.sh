#!/usr/bin/env bash
set -euo pipefail

npm run build
npm test

if [ $# -eq 0 ]; then
  npm version patch
else
  npm version "$@"
fi

PUBLISH_TAG="latest"
VERSION=$(node -p "require('./package.json').version")

if [[ "$VERSION" == *-* ]]; then
  PUBLISH_TAG="${VERSION#*-}"
  PUBLISH_TAG="${PUBLISH_TAG%.*}"
fi

npm publish --tag "$PUBLISH_TAG"
git push
git push origin "v${VERSION}"
