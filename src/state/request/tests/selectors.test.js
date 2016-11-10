import {
	getSelectedEndpoint,
	getUrl,
	getPathValues,
	getMethod,
	getQueryParams,
	getBodyParams,
	getEndpointPathParts,
	getCompleteQueryUrl,
	getRequestMethod,
	filterEndpoints,
} from '../selectors';

it( 'getSelectedEndpoint should return the selected endpoint', () => {
	const endpoint = { path_labeled: 'myEndpoint' };
	const state = {
		request: { endpoint },
	};

	expect( getSelectedEndpoint( state ) ).toEqual( endpoint );
} );

it( 'getUrl should return the defined url', () => {
	const url = '/url';
	const state = {
		request: { url },
	};

	expect( getUrl( state ) ).toEqual( url );
} );

it( 'getPathValues should return the defined pathValues', () => {
	const pathValues = { $site: 'mysite', toto: 'tata' };
	const state = {
		request: {
			endpoint: {
				request: {
					path: {
						$site: {},
					},
				},
			},
			pathValues,
		},
	};

	expect( getPathValues( state ) ).toEqual( { $site: 'mysite' } );
} );

it( 'getMethod should return the selected method', () => {
	const method = 'GET';
	const state = {
		request: { method },
	};

	expect( getMethod( state ) ).toEqual( method );
} );

it( 'getQueryParams should return the defined queryParams', () => {
	const queryParams = { context: 'view', toto: 'tata' };
	const state = {
		request: {
			endpoint: {
				request: {
					query: {
						context: {},
					},
				},
			},
			queryParams,
		},
	};

	expect( getQueryParams( state ) ).toEqual( { context: 'view' } );
} );

it( 'getBodyParams should return the defined bodyParams', () => {
	const bodyParams = { context: 'view', toto: 'tata' };
	const state = {
		request: {
			endpoint: {
				request: {
					body: {
						context: {},
					},
				},
			},
			bodyParams,
		},
	};

	expect( getBodyParams( state ) ).toEqual( { context: 'view' } );
} );

it( 'getEndpointPathParts should explode the endpoint path correctly', () => {
	const endpoint = { path_labeled: '/site/$site/posts/slug:$slug' };
	const state = {
		request: { endpoint },
	};

	expect( getEndpointPathParts( state ) )
		.toEqual( [ '/site/', '$site', '/posts/slug:', '$slug' ] );
} );

describe( 'getCompleteQueryUrl', () => {
	it( 'should use the url if not endpoint is selected', () => {
		const state = {
			request: { url: '/help?a=b' },
		};

		expect( getCompleteQueryUrl( state ) ).toEqual( '/help?a=b' );
	} );

	it( 'should use the endpoint path, pathParts and queryParams if an endpoint is selected', () => {
		const state = {
			request: {
				endpoint: {
					path_labeled: '/site/$site/posts/slug:$slug',
					request: {
						path: { $site: {}, $slug: {} },
						query: { context: {}, page: {} },
					},
				},
				pathValues: {
					$site: 'testsite.wordpress.com',
					$slug: '10',
				},
				queryParams: {
					context: 'view',
					page: '',
				},
			},
		};

		expect( getCompleteQueryUrl( state ) ).toEqual( '/site/testsite.wordpress.com/posts/slug:10?context=view' );
	} );
} );

describe( 'getRequestMethod', () => {
	it( 'should use the method if not endpoint is selected', () => {
		const state = {
			request: { method: 'DELETE' },
		};

		expect( getRequestMethod( state ) ).toEqual( 'DELETE' );
	} );

	it( 'should use the endpoint method if there is a selected endpoint', () => {
		const state = {
			request: {
				endpoint: { method: 'POST' },
				method: 'GET',
			},
		};

		expect( getRequestMethod( state ) ).toEqual( 'POST' );
	} );
} );

describe( 'filterEndpoints', () => {
	it( 'should filter based on path', () => {
		const state = {
			request: { url: 'Comments' },
		};
		const endpoints = [
			{ path_labeled: '/sites/me', description: '' },
			{ path_labeled: '/comments', description: '' },
		];

		expect( filterEndpoints( state, endpoints ) )
			.toEqual( [ { path_labeled: '/comments', description: '' } ] );
	} );

	it( 'should filter based on description', () => {
		const state = {
			request: { url: 'current' },
		};
		const endpoints = [
			{ path_labeled: '/sites/me', description: 'Current User' },
			{ path_labeled: '/comments', description: '' },
		];

		expect( filterEndpoints( state, endpoints ) )
			.toEqual( [ { path_labeled: '/sites/me', description: 'Current User' } ] );
	} );
} );
