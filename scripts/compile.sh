#!/bin/bash

set -e

echo "Compiling SoundtrackOptical.js DOM library for browsers + canvas"

./node_modules/.bin/tsc ./src/dom/index.ts --outFile ./dist/dom/SoundtrackOptical.js -noImplicitAny --lib ES2017 --lib ES2016 --lib dom -t ES2015

echo "Compiling SoundtrackOptical.js node library"

./node_modules/.bin/tsc -p ./tsconfig.json
