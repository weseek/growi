#!/bin/sh

set -e

# Support `FILE_UPLOAD=local`
mkdir -p /data/uploads
if [ ! -e "./public/uploads" ]; then
  ln -s /data/uploads ./public/uploads
fi

chown -R node:node /data/uploads
chown -h node:node ./public/uploads

exec gosu node /bin/bash -c "$@"
