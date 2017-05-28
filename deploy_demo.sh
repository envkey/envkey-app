#!/bin/bash

(export DEMO_BUILD=true API_HOST=https://envkey-api-demo.herokuapp.com/api/v1 && ./build.sh)
sleep 1
netlify deploy -s envkey-demo -p envkey-assets/build