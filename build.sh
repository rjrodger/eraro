#!/bin/sh

./node_modules/.bin/jshint eraro.js
./node_modules/.bin/docco eraro.js -o doc
cp -r doc/* ../gh-pages/eraro/doc
