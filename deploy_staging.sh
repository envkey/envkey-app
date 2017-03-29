#!/bin/bash

./build.sh
sleep 1
netlify deploy -s envkey-staging -p envkey-assets/build