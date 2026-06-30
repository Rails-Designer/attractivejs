#!/usr/bin/env bash
set -euo pipefail

npm run build
npm test

if [ $# -eq 0 ]; then
  npm version patch
else
  npm version "$@"
fi

npm publish
git push
git push --tags
