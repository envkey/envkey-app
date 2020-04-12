#!/bin/bash
echo "Building middleman assets for production"
(export ASSET_HOST=assets && ./build_prod.sh)

echo "Clearing envkey-electron/assets and envkey-electron/dist"
rm -rf envkey-electron/assets/*
rm -rf envkey-electron/dist/*
rm envkey-assets/source/javascripts/*

echo "Copying assets to envkey-electron"
cp -r envkey-assets/build/fonts envkey-assets/build/images envkey-assets/build/stylesheets envkey-electron/assets/
cp envkey-assets/build/javascripts/* envkey-assets/build/*.js envkey-electron/assets/

echo "Building and signing apps"
export WIN_CSC_LINK=~/envkey-digicert.p12
export WIN_CSC_KEY_PASSWORD=$(cat .wincertpw)
# (cd envkey-electron && npm run dist && npm run publish)
(cd envkey-electron && npm run dist)

echo "Clearing middleman build and electron assets"
rm -rf envkey-assets/build/*
rm -rf envkey-electron/assets/*
rm envkey-assets/source/javascripts/*