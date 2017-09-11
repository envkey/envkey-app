#!/bin/bash

(export PRODUCTION_BUILD=true API_HOST=https://beta.envkey.com/api/v1 && ./build.sh)