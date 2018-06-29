#!/bin/bash

./build_demo.sh
sleep 1
netlifyctl deploy -n envkey-demo -P envkey-assets/build