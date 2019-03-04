#!/bin/bash
# Installs the correct versions of Node and Ruby, then installs npm packages and gems.
set -e

if type nvm > /dev/null 2>&1; then
  if ! nvm ls 6.6.0 | grep -q 6.6.0; then
    nvm install 6.6.0
  fi
  nvm use 6.6.0
fi

if type rvm > /dev/null 2>&1; then
  [[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm"
  if ! rvm ls | grep -q ruby-2.3.1; then
    rvm install 2.3.1
  fi
fi

if ! which bundle > /dev/null 2>&1; then
  gem install bundler
fi

(
  cd envkey-electron
  npm install
)

(
  cd envkey-react
  npm install
)

(
  cd envkey-assets
  [[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm"
  rvm use 2.3.1
  bundle install
)
