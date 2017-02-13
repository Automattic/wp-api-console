#!/usr/bin/env node

const path = require( 'path' );

// webpack.config.prod.js checks this.
process.env.NODE_ENV = 'production';

// Load the create-react-app config.
const webpackConfigProd = require( 'react-scripts/config/webpack.config.prod' );

// Modify the config according to our needs.

const babelLoader = webpackConfigProd.module.loaders
	.find( loader => loader.loader === 'babel' );

if ( ! babelLoader ) {
	console.error( webpackConfigProd.module.loaders );
	throw new Error( 'Couldn\'t find the babel loader config.' );
}

babelLoader.query.plugins = ( babelLoader.query.plugins || [] )
	.filter( pluginName => pluginName !== 'lodash' )
	.concat( 'lodash' );

console.log( 'Added lodash babel plugin to build' );

if ( process.env.WPCOM_BUILD ) {
	babelLoader.query.plugins.push( path.resolve(
		__dirname, '..', 'src', 'lib', 'babel-replace-config-import.js'
	) );
	console.log( 'Added config override for WP.com build' );
}

// Run the build.
require( 'react-scripts/scripts/build' );
