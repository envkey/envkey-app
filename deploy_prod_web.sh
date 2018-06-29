#!/bin/bash

(K8S_BUILD=true && ./build_prod.sh)
sleep 1
rm netlify.toml
netlifyctl deploy -n envkey-k8s -P envkey-assets/build
rm netlify.toml