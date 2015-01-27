if [ ! -d "./node_modules/mocha" ]; then
  npm install mocha@1
fi

node test/eraro.test.js
