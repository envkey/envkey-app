#!/bin/bash

(PRODUCTION_BUILD=true && ./build.sh)
netlify deploy -s envkey-prod -p envkey-assets/build