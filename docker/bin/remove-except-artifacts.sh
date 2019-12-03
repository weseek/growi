#!/bin/sh

set -e

rm -rf \
  ${appDir}/bin \
  ${appDir}/docker \
  ${appDir}/node_modules \
  ${appDir}/src/client \
  ${appDir}/babel.config.js \
