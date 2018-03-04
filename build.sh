#!/bin/bash

echo "Cleaning build dirs"
rm -rf envkey-react/build/*
rm -rf envkey-assets/build/*
rm -rf envkey-assets/source/javascripts/*
echo "Running webpack..."
(cd envkey-react && webpack --config webpack.config.build.js --progress)
echo "Copying js output into middleman source"
cp envkey-react/build/* envkey-assets/source/javascripts/
echo "Running middleman build..."
(cd envkey-assets && bundle exec middleman build)
echo "Copying _redirects into build dir"
cp envkey-assets/source/_redirects envkey-assets/build/
echo "Build complete"