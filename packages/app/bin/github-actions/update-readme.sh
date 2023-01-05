#!/bin/sh

cd docker

sed -i -e "s/^\([*] \[\`\)[^\`]\+\(\`, \`6\.0\`, .\+\]\)\(.\+\/blob\/v\).\+\(\/packages\/app\/docker\/Dockerfile.\+\)$/\1${RELEASED_VERSION}\2\3${RELEASED_VERSION}\4/" README.md
