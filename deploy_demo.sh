#!/bin/bash

(export DEMO_BUILD=true && ./build.sh)
netlify deploy -s envkey-demo -p envkey-assets/build