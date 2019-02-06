#!/bin/bash

(export API_HOST=https://envkey-api-demo.herokuapp.com/api && ./build.sh)
./build_demo.sh
sleep 1
rm netlify.toml
netlifyctl deploy -n envkey-demo -P envkey-assets/build
rm netlify.toml