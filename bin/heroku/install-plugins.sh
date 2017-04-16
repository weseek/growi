#!/bin/sh

export IFS=","

for plugin in $INSTALL_PLUGINS; do
  npm install --save $plugin
done
