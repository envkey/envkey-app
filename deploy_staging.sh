#!/bin/bash

(export API_HOST=https://api-staging.envkey.com/api/v1 && ./build.sh)
sleep 1
netlify deploy -s envkey-staging -p envkey-assets/build
