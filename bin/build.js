#!/usr/bin/env node
const esbuild = require( 'esbuild' );
const fs = require( 'fs' );

const { htmlPlugin } = require( '@craftamap/esbuild-plugin-html' );

// webpack.config.prod.js checks this.
process.env.NODE_ENV = 'production';

esbuild.build({
	assetNames: 'static/media/[name].[hash]',
	bundle: true,
	define: {
		global: "{}"
	},
	entryNames: 'static/js/main.[hash]',
	entryPoints: ["src/index.js"],
	metafile: true,
	minify: true,
	loader: {
		'.js': 'jsx',
		'.png': 'file',
		'.eot': 'file',
		'.svg': 'file',
		'.ttf': 'file'
	},
	plugins: [
		htmlPlugin({
			files: [{
				entryPoints: 'src/index.js',
				filename: 'index.html',
				htmlTemplate: fs.readFileSync('public/index.html')
			}]
		})
	],
	outdir: 'build',
	sourcemap: 'linked',
	target: 'es6',
	watch: false,
})
	.then( () => console.log( '⚡️ Done' ) )
	.catch( () => process.exit( 1 ) );