#!/bin/bash

(export API_HOST=https://api-staging.envkey.com/api/v1 && ./build.sh)
sleep 1
netlifyctl deploy -n envkey-staging -P envkey-assets/build