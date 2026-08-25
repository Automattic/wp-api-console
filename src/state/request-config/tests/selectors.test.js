import { getRequestConfigSource } from '../selectors';

const state = {
	ui: {
		api: 'WP.COM API',
		version: 'v1.1',
		theme: 'midnight',
		unrelatedUiValue: 'do-not-leak',
	},
	request: {
		endpoint: {
			method: 'POST',
			pathLabeled: '/sites/$site/comments/new',
			request: {
				path: { $site: {} },
				query: { status: {} },
				body: { content: {} },
			},
		},
		pathValues: {
			$site: 'example.wordpress.com',
			extraPathValue: 'secret',
		},
		queryParams: {
			status: 'approved',
			extraQueryParam: 'secret',
		},
		bodyParams: {
			content: 'Hello',
			extraBodyParam: 'secret',
		},
		url: '/should/not/leak',
		method: 'GET',
	},
	results: {
		1: { id: 1, status: 200 },
	},
	history: {
		wpcom: {
			v1: [ { pathLabeled: 'historical-endpoint' } ],
		},
	},
	security: {
		wpcom: {
			token: 'sentinel-security-token',
		},
	},
};

it( 'returns only the request config source fields and no unrelated state', () => {
	const source = getRequestConfigSource( state );

	expect( source ).toEqual( {
		api: 'WP.COM API',
		version: 'v1.1',
		endpoint: state.request.endpoint,
		pathValues: state.request.pathValues,
		queryParams: state.request.queryParams,
		bodyParams: state.request.bodyParams,
	} );
	expect( Object.keys( source ) ).toEqual( [
		'api',
		'version',
		'endpoint',
		'pathValues',
		'queryParams',
		'bodyParams',
	] );
	expect( JSON.stringify( source ) ).not.toContain( 'sentinel-security-token' );
	expect( JSON.stringify( source ) ).not.toContain( 'historical-endpoint' );
	expect( JSON.stringify( source ) ).not.toContain( '/should/not/leak' );
	expect( JSON.stringify( source ) ).not.toContain( 'do-not-leak' );
} );
