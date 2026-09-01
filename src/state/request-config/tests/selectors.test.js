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
		1: { id: 1, status: 200, leakSentinel: 'results-leak-sentinel' },
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
	const sourceJson = JSON.stringify( source );

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
	expect( sourceJson ).not.toContain( 'sentinel-security-token' );
	expect( sourceJson ).not.toContain( 'results-leak-sentinel' );
	expect( sourceJson ).not.toContain( 'historical-endpoint' );
	expect( sourceJson ).not.toContain( '/should/not/leak' );
	expect( sourceJson ).not.toContain( 'do-not-leak' );
} );
