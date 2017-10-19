#!/usr/bin/env node

const fs = require( 'fs' );
const path = require( 'path' );

const tinyMCELinkPath = path.resolve(
	__dirname, '..', 'public', 'tinymce.min.js'
);
if ( ! fs.existsSync( tinyMCELinkPath ) ) {
	fs.symlinkSync( '../node_modules/tinymce/tinymce.min.js', tinyMCELinkPath );
	console.log( 'Linked TinyMCE build to', tinyMCELinkPath );
}

// Run the development server.
require( 'react-scripts/scripts/start' );
