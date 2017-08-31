#!/bin/bash

(export API_HOST=https://af975d9b18d1a11e784500e71cf48549-1307187340.us-east-1.elb.amazonaws.com/api/v1 && ./build.sh)
sleep 1
netlify deploy -s envkey-staging -p envkey-assets/build