#!/bin/sh

BASE_DIR="$(dirname "$0")"
cd "$BASE_DIR"
cd ..

echo "===================="
echo "BUILDING THE CONSOLE"
echo "===================="
WPCOM_BUILD=y npm run build || exit 1

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
CSS_FILENAME="$(basename build/static/*.css)"
JS_FILENAME="$(basename build/static/*.js)"
echo "css : $CSS_FILENAME"
echo "js  : $JS_FILENAME"
sed \
	-e "s/{CSS_FILENAME}/$CSS_FILENAME/g" \
	-e "s/{JS_FILENAME}/$JS_FILENAME/g" \
	theme/console3.php \
	> build-theme/console3.php \
	|| exit 1

echo
echo "========"
echo "ALL DONE"
echo "========"
echo "Files in build-theme/ directory are ready for deploy."
