#/usr/bin/env node

var githubRemoveAllReleases = require('github-remove-all-releases');

var AUTH = {
  type: 'oauth',
  token: process.env.GITHUB_TOKEN
};

githubRemoveAllReleases(AUTH, 'envkey', 'envkey-ui', function(err, data){
  console.log("err: ", err);
  console.log("res: ", data);
});