if [ ! -d "./node_modules/jshint" ]; then
  npm install jshint@2
fi

if [ ! -d "./node_modules/docco" ]; then
  npm install docco@0
fi

./node_modules/.bin/jshint eraro.js
./node_modules/.bin/docco eraro.js -o doc
cp -r doc/* ../gh-pages/eraro/doc
