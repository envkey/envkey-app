#!/bin/bash

(export PRODUCTION_BUILD=true && ./build.sh)
sleep 1
netlify deploy -s envkey -p envkey-assets/build