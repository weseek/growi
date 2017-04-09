#!/bin/sh

# Trigger a new run
# see: http://devcenter.wercker.com/docs/api/endpoints/runs#trigger-a-run

# exec curl
#
# require
#   - $WERCKER_TOKEN
#   - $CROWI_PLUS_DOCKER_PIPELINE_ID
#   - $RELEASE_VERSION
#
RESPONSE=`curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $WERCKER_TOKEN" \
  https://app.wercker.com/api/v3/runs -d '{ \
    "pipelineId": "'$CROWI_PLUS_DOCKER_PIPELINE_ID'", \
    "branch": "release", \
    "envVars": [ \
      { \
        "key": "RELEASE_VERSION", \
        "value": "'$RELEASE_VERSION'" \
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
