#!/bin/bash
echo "Building middleman assets for production"
(export ASSET_HOST=assets DEBUG_BUILD=true && ./build_prod.sh)

echo "Clearing envkey-electron/assets and envkey-electron/dist"
rm -rf envkey-electron/assets/*
rm -rf envkey-electron/dist/*
rm envkey-assets/source/javascripts/*

echo "Copying assets to envkey-electron"
cp -r envkey-assets/build/fonts envkey-assets/build/images envkey-assets/build/stylesheets envkey-electron/assets/
cp envkey-assets/build/javascripts/* envkey-assets/build/*.js envkey-electron/assets/

# echo "Building dmg only without signing"
# export CSC_IDENTITY_AUTO_DISCOVERY=false
(cd envkey-electron && npm run distmac)

echo "Clearing middleman build and electron assets"
rm -rf envkey-assets/build/*
rm -rf envkey-electron/assets/*
rm envkey-assets/source/javascripts/*
