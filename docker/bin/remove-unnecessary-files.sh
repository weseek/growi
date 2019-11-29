#!/bin/sh

set -e

rm -rf \
  ${appDir}/.github \
  ${appDir}/.vscode \
  ${appDir}/bin \
  ${appDir}/docker \
  ${appDir}/src/client \
  ${appDir}/src/linter-checker \
  ${appDir}/src/test \
  ${appDir}/.editorconfig \
  ${appDir}/.eslint* \
  ${appDir}/.gitignore \
  ${appDir}/.prettier* \
  ${appDir}/.stylelint* \
  ${appDir}/app.json \
  ${appDir}/babel.config.js \
  ${appDir}/Procfile \
  ${appDir}/wercker.yml
