#!/bin/sh

BASE_DIR="$(dirname "$0")"
cd "$BASE_DIR"
cd ..

echo "===================="
echo "BUILDING THE CONSOLE"
echo "===================="
CONFIG=src/config.prod.json npm run build || exit 1

echo
echo "==================="
echo "COPYING BUILT FILES"
echo "==================="
rm -rf build-theme/ || exit 1
mkdir build-theme/ || exit 1
cp -va build/ build-theme/console3/ || exit 1

echo
echo "========================"
echo "GENERATING PAGE TEMPLATE"
echo "========================"
cp -va theme/console3.php build-theme/ || exit 1
CSS_FILENAME="$(basename build/static/css/*.css)"
echo "css : $CSS_FILENAME"
echo "js  : $CSS_FILENAME"
JS_FILENAME="$(basename build/static/js/*.js)"
sed -i '' "s/{CSS_FILENAME}/$CSS_FILENAME/g" build-theme/console3.php || exit 1
sed -i '' "s/{JS_FILENAME}/$JS_FILENAME/g" build-theme/console3.php || exit 1

echo
echo "========"
echo "ALL DONE"
echo "========"
echo "Files in build-theme/ directory are ready for deploy."
