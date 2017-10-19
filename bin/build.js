#!/usr/bin/env node

const path = require( 'path' );

// webpack.config.prod.js checks this.
process.env.NODE_ENV = 'production';

// Load the create-react-app config.
const webpackConfigProd = require( 'react-scripts/config/webpack.config.prod' );

// Modify the config according to our needs.

const rules = webpackConfigProd.module.rules;
// rules:
// [ { test: /\.(js|jsx)$/,
//     enforce: 'pre',
//     use:
//      [ { ... loader: '/.../node_modules/eslint-loader/index.js' } ],
//     include: '/home/james/a8c/code/wp-api-console/src' },
//   { oneOf:
//      [ { ... test: [ /\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/ ] },
//        { test: /\.(js|jsx)$/,
//          include: '/home/james/a8c/code/wp-api-console/src',
//          loader: '/.../node_modules/babel-loader/lib/index.js',
//          options:
//           { babelrc: false,
//             presets: [ '/.../node_modules/babel-preset-react-app/...' ],
//             compact: true } },
//        { ... test: /\.css$/ },
//        { ... loader: '/.../node_modules/file-loader/index.js' } ] } ]
const choiceRule = rules.find( rule => !! rule.oneOf );
const babelLoader = choiceRule.oneOf.find( choice => /babel-loader/.test( choice.loader ) );

if ( ! babelLoader ) {
	console.error( webpackConfigProd.module.loaders );
	throw new Error( 'Couldn\'t find the babel loader config.' );
}

babelLoader.options.plugins = ( babelLoader.options.plugins || [] )
	.filter( pluginName => pluginName !== 'lodash' )
	.concat( 'lodash' );

console.log( 'Added lodash babel plugin to build' );

if ( process.env.WPCOM_BUILD ) {
	babelLoader.options.plugins.push( path.resolve(
		__dirname, '..', 'src', 'lib', 'babel-replace-config-import.js'
	) );
	console.log( 'Added config override for WP.com build' );
}

// Run the build.
require( 'react-scripts/scripts/build' );
