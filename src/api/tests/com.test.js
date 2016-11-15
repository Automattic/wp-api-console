import clone from 'lodash/clone';

import { api } from '../com';

function getEndpointTestData() {
	/* eslint-disable camelcase */
	return clone( [
		{
			description: 'Get information about a plugin.',
			method: 'GET',
			group: '__do_not_document',
			request: {
				path: {
					$site: {
						type: '(int|string)',
						description: 'Site ID or domain',
					},
					$plugin: {
						type: '(string)',
						description: 'The plugin ID',
					},
				},
				query: {
					context: {
						type: '(string)',
						description: {
							display: '(default) Formats the output as HTML for display.  Shortcodes are parsed, paragraph tags are added, etc..',
							edit: 'Formats the output for editing.  Shortcodes are left unparsed, significant whitespace is kept, etc..',
						},
					},
				},
				body: [],
			},
			path_format: '/sites/%s/plugins/%s/',
			path_labeled: '/sites/$site/plugins/$plugin/',
		},
		{
			description: 'Force immediate sync of top items on a queue',
			method: 'POST',
			group: '',
			request: {
				path: {
					$site: {
						type: '(int|string)',
						description: 'The site ID, The site domain',
					},
				},
				query: {
					pretty: {
						type: '(bool)',
						description: {
							'false': '(default) ',
							'true': 'Output pretty JSON',
						},
					},
				},
				body: {
					queue: {
						type: '(string)',
						description: 'sync or full_sync',
					},
				},
			},
			path_format: '/sites/%s/sync/now',
			path_labeled: '/sites/$site/sync/now',
		},
		{
			description: 'Get number of posts in the post type groups by post status',
			method: 'GET',
			group: 'sites',
			request: {
				path: {
					$site: {
						type: '(int|string)',
						description: 'Site ID or domain',
					},
					$post_type: {
						type: '(string)',
						description: 'Post Type',
					},
				},
				query: {
					pretty: {
						type: '(bool)',
						description: {
							'false': '(default) ',
							'true': 'Output pretty JSON',
						},
					},
					author: {
						type: '(int)',
						description: 'author ID',
					},
				},
				body: [],
			},
			path_format: '/sites/%s/post-counts/%s',
			path_labeled: '/sites/$site/post-counts/$post_type',
		},
	] );
	/* eslint-enable camelcase */
}

describe( 'parseEndpoints', () => {
	it( 'should parse endpoints from the /rest/vX/help response', () => {
		const parsed = api.parseEndpoints( getEndpointTestData() );
		expect( parsed.length ).toEqual( 3 );

		expect( parsed[ 0 ].method ).toEqual( 'GET' );
		expect( parsed[ 0 ].group ).toEqual( 'sites' );
		expect( parsed[ 0 ].pathFormat ).toEqual( '/sites/%s/post-counts/%s' );
		expect( parsed[ 0 ].path_format ).toBeUndefined();
		expect( parsed[ 0 ].pathLabeled ).toEqual( '/sites/$site/post-counts/$post_type' );
		expect( parsed[ 0 ].path_labeled ).toBeUndefined();

		expect( parsed[ 1 ].method ).toEqual( 'POST' );
		expect( parsed[ 1 ].group ).toEqual( '' );
		expect( parsed[ 1 ].pathFormat ).toEqual( '/sites/%s/sync/now' );
		expect( parsed[ 1 ].path_format ).toBeUndefined();
		expect( parsed[ 1 ].pathLabeled ).toEqual( '/sites/$site/sync/now' );
		expect( parsed[ 1 ].path_labeled ).toBeUndefined();

		expect( parsed[ 2 ].method ).toEqual( 'GET' );
		expect( parsed[ 2 ].group ).toEqual( '__do_not_document' );
		expect( parsed[ 2 ].pathFormat ).toEqual( '/sites/%s/plugins/%s/' );
		expect( parsed[ 2 ].path_format ).toBeUndefined();
		expect( parsed[ 2 ].pathLabeled ).toEqual( '/sites/$site/plugins/$plugin/' );
		expect( parsed[ 2 ].path_labeled ).toBeUndefined();
	} );
} );
