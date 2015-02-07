#!/bin/bash
set -e # exit with nonzero if anything fails

# clear and recreate the out dir
rm -rf app || exit 0;
mkdir app;

# compile
npm install

cd app
git init

git config user.name "Travis-CI"
git config user.email "johnjmartiniv@gmail.com"

git add .
git commit -m "Deployed to Github Pages"
git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1
