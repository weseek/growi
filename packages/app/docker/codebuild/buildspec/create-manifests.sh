#!/bin/bash

ARGUMENT_LIST=(
  "target-image"
  "tags"
  "source-manifests"
)


# read arguments
opts=$(getopt \
  --longoptions "$(printf "%s:," "${ARGUMENT_LIST[@]}")" \
  --name "$(basename "$0")" \
  --options "" \
  -- "$@"
)

eval set --$opts

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source-manifests)
      sourceManifests=$2
      shift 2
      ;;

    --target-image)
      targetImage=$2
      shift 2
      ;;

    --tags)
      tags=$2
      shift 2
      ;;

    *)
      break
      ;;
  esac
done

for tag in $(echo $tags | tr "," "\n")
do
    tag=`echo $tag | awk '{gsub(/ /,""); print}'`
    echo "docker manifest create $targetImage:$tag $sourceManifests"
    eval "docker manifest create $targetImage:$tag $sourceManifests"
    echo "docker manifest push $targetImage:$tag"
    eval "docker manifest push $targetImage:$tag"
done
