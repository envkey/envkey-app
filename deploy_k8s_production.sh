#!/bin/bash

(export PRODUCTION_BUILD=true API_HOST=https://beta.envkey.com/api/v1 && ./build.sh)
sleep 1
netlify deploy -s envkey-k8s -p envkey-assets/build