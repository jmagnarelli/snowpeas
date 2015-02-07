#!/bin/bash
set -e # exit with nonzero if anything fails

# clear and recreate the out dir
rm -rf out || exit 0;
mkdir out;

# compile
npm install

cd out
git init

git config user.name "Travis-CI"
git config user.email "johnjmartiniv@gmail.com"

cd ..
cp -r app/. out
cp CNAME out
cd out

git add .
git commit -m "Deployed to Github Pages"
git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1

# clean up
cd ..
rm -rf out;
