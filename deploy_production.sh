#!/bin/bash

(export PRODUCTION_BUILD=true && ./build.sh)
netlify deploy -s envkey -p envkey-assets/build