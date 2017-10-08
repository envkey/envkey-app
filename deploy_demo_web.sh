#!/bin/bash

./build_demo.sh
sleep 1
netlify deploy -s envkey-demo -p envkey-assets/build