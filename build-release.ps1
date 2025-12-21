rimraf build
rimraf web-ext-artifacts

Copy-Item -Force -Recurse ./static/icons ./src
npm run lint
npm run test
webpack --config ./webpack.prod
Copy-Item -Force -Recurse ./static/icons ./build
web-ext build -s ./build/

Compress-Archive -Path ./docs,./src,./package.json,./package-lock.json -DestinationPath ./web-ext-artifacts/source.zip

rimraf ./src/icons
