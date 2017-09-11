#!/bin/bash

(K8S_BUILD=true && ./build_prod.sh)
sleep 1
netlify deploy -s envkey-k8s -p envkey-assets/build