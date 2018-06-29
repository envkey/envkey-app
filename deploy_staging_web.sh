#!/bin/bash

(export API_HOST=https://api-staging.envkey.com/api && ./build.sh)
sleep 1
rm netlify.toml
netlifyctl deploy -n envkey-staging -P envkey-assets/build
rm netlify.toml