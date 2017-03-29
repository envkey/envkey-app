#!/bin/bash

(export DEMO_BUILD=true && ./build.sh)
sleep 1
netlify deploy -s envkey-demo -p envkey-assets/build