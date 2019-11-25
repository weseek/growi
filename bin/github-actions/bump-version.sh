#!/bin/sh

cd docker

sed -i -e "s/^\([*] \[\`\)[^\`]\+\(\`, \`3\.5\`, .\+\]\)\(.\+\/blob\/v\).\+\(\/Dockerfile.\+\)$/\1${RELEASE_VERSION}\2\3${RELEASE_VERSION}\4/" README.md
sed -i -e "s/^\([*] \[\`\)[^\`]\+\(\`, \`3\.5-nocdn\`, .\+\]\)\(.\+\/blob\/v\).\+\(\/nocdn\/Dockerfile.\+\)$/\1${RELEASE_VERSION}-nocdn\2\3${RELEASE_VERSION}\4/" README.md
