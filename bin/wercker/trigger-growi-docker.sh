#!/bin/sh

# Trigger a new run
# see: http://devcenter.wercker.com/docs/api/endpoints/runs#trigger-a-run

# exec curl
#
# require
#   - $WERCKER_TOKEN
#   - $GROWI_DOCKER_PIPELINE_ID
#   - $RELEASE_VERSION
#   - $WERCKER_GIT_COMMIT
#
RESPONSE=`curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $WERCKER_TOKEN" \
  https://app.wercker.com/api/v3/runs -d '{ \
    "pipelineId": "'$GROWI_DOCKER_PIPELINE_ID'", \
    "branch": "master", \
    "envVars": [ \
      { \
        "key": "RELEASE_VERSION", \
        "value": "'$RELEASE_VERSION'" \
      }, \
      { \
        "key": "GROWI_REPOS_GIT_COMMIT", \
        "value": "'$WERCKER_GIT_COMMIT'" \
      } \
    ] \
  }' \
`

echo $RESPONSE | jq .

# get wercker run id
RUN_ID=`echo $RESPONSE | jq .id`
# exit with failure status
if [ "$RUN_ID" = "null" ]; then
  exit 1
fi
