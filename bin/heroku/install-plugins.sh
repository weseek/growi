#!/bin/sh

export IFS=","

for plugin in $INSTALL_PLUGINS; do
  yarn add $plugin
done
