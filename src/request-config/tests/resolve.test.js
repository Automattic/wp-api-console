import { vi } from 'vitest';

vi.mock( '../../api', () => ( { findByName: vi.fn() } ) );
vi.mock( '../../api/discovery', () => ( { fetchEndpoints: vi.fn() } ) );

import { findByName } from '../../api';
import { fetchEndpoints } from '../../api/discovery';
import { RequestConfigError } from '../errors';
import { resolveRequestConfig } from '../resolve';

const canonicalEndpoint = {
	method: 'GET',
	pathLabeled: '/sites/$site/comments/$comment_ID',
	request: {
		path: {
			$site: { type: 'string' },
			$comment_ID: { type: 'string' },
		},
		query: {
			context: {},
			pretty: {},
		},
		body: {},
	},
};

const config = {
	schemaVersion: 1,
	request: {
		api: 'WP.COM API',
		version: 'v1.1',
		method: 'GET',
		endpoint: '/sites/$site/comments/$comment_ID',
		pathValues: { $site: '', $comment_ID: 0 },
		queryParams: { context: false },
		bodyParams: {},
	},
};

const createApi = ( versionData = { versions: [ 'v1', 'v1.1' ] } ) => {
	return {
		name: 'WP.COM API',
		loadVersions: vi.fn( () => Promise.resolve( versionData ) ),
	};
};

const createDependencies = ( overrides = {} ) => {
	return {
		findApi: vi.fn( () => createApi() ),
		fetchEndpoints: vi.fn( () => Promise.resolve( [ canonicalEndpoint ] ) ),
		...overrides,
	};
};

beforeEach( () => {
	vi.clearAllMocks();
} );

describe( 'resolveRequestConfig', () => {
	it( 'uses the production default exact API lookup and shared endpoint discovery', async () => {
		const api = createApi();
		findByName.mockReturnValue( api );
		fetchEndpoints.mockResolvedValue( [ canonicalEndpoint ] );

		await expect( resolveRequestConfig( config ) ).resolves.toEqual( {
			api: 'WP.COM API',
			version: 'v1.1',
			endpoint: canonicalEndpoint,
			pathValues: config.request.pathValues,
			queryParams: config.request.queryParams,
			bodyParams: config.request.bodyParams,
		} );

		expect( findByName ).toHaveBeenCalledWith( 'WP.COM API' );
		expect( fetchEndpoints ).toHaveBeenCalledWith( api, 'v1.1' );
		expect( api.loadVersions ).toHaveBeenCalledTimes( 1 );
		expect( config.request.pathValues ).toEqual( { $site: '', $comment_ID: 0 } );
	} );

	it( 'returns the canonical discovered endpoint and imported values without cloning or mutating', async () => {
		const dependencies = createDependencies();
		const original = JSON.parse( JSON.stringify( config ) );

		const result = await resolveRequestConfig( config, dependencies );

		expect( result.endpoint ).toBe( canonicalEndpoint );
		expect( result.pathValues ).toBe( config.request.pathValues );
		expect( result.queryParams ).toBe( config.request.queryParams );
		expect( result.bodyParams ).toBe( config.request.bodyParams );
		expect( config ).toEqual( original );
		expect( dependencies.findApi ).toHaveBeenCalledWith( 'WP.COM API' );
		expect( dependencies.fetchEndpoints ).toHaveBeenCalledWith( expect.any( Object ), 'v1.1' );
	} );

	it( 'rejects an unknown API without using a fallback', async () => {
		const dependencies = createDependencies( {
			findApi: vi.fn( () => undefined ),
		} );

		await expect( resolveRequestConfig( config, dependencies ) ).rejects.toMatchObject( {
			code: 'UNKNOWN_API',
			message: 'Unknown API: WP.COM API.',
		} );
		expect( dependencies.findApi ).toHaveBeenCalledWith( 'WP.COM API' );
		expect( dependencies.findApi.mock.results[ 0 ].value ).toBeUndefined();
		expect( dependencies.fetchEndpoints ).not.toHaveBeenCalled();
	} );

	it( 'rejects a loadVersions failure as a typed version discovery error', async () => {
		const api = {
			name: 'WP.COM API',
			loadVersions: vi.fn( () => Promise.reject( new Error( 'version feed down' ) ) ),
		};
		const dependencies = createDependencies( {
			findApi: vi.fn( () => api ),
		} );

		await expect( resolveRequestConfig( config, dependencies ) ).rejects.toMatchObject( {
			code: 'VERSION_DISCOVERY_FAILED',
			message: 'version feed down',
		} );
		expect( dependencies.fetchEndpoints ).not.toHaveBeenCalled();
	} );

	it( 'rejects an unavailable version', async () => {
		const dependencies = createDependencies( {
			findApi: vi.fn( () => createApi( { versions: [ 'v1' ] } ) ),
		} );

		await expect( resolveRequestConfig( config, dependencies ) ).rejects.toMatchObject( {
			code: 'UNKNOWN_VERSION',
			message: 'Unknown version: v1.1.',
		} );
		expect( dependencies.fetchEndpoints ).not.toHaveBeenCalled();
	} );

	it( 'rejects discovery failures from endpoint loading or parsing', async () => {
		const dependencies = createDependencies( {
			fetchEndpoints: vi.fn( () => Promise.reject( new Error( 'network down' ) ) ),
		} );

		await expect( resolveRequestConfig( config, dependencies ) ).rejects.toMatchObject( {
			code: 'DISCOVERY_FAILED',
			message: 'network down',
		} );
	} );

	it( 'rejects unknown endpoints', async () => {
		const dependencies = createDependencies( {
			fetchEndpoints: vi.fn( () => Promise.resolve( [] ) ),
		} );

		await expect( resolveRequestConfig( config, dependencies ) ).rejects.toMatchObject( {
			code: 'UNKNOWN_ENDPOINT',
			message: 'Endpoint not found: GET /sites/$site/comments/$comment_ID.',
		} );
	} );

	it( 'rejects ambiguous endpoints', async () => {
		const dependencies = createDependencies( {
			fetchEndpoints: vi.fn( () => Promise.resolve( [ canonicalEndpoint, { ...canonicalEndpoint } ] ) ),
		} );

		await expect( resolveRequestConfig( config, dependencies ) ).rejects.toMatchObject( {
			code: 'AMBIGUOUS_ENDPOINT',
			message: 'Endpoint is ambiguous: GET /sites/$site/comments/$comment_ID.',
		} );
	} );

	it.each( [
		[ 'queryParams', { context: 'display', unknown: true }, 'UNKNOWN_QUERY_PARAM', 'Unknown query parameter: unknown.' ],
		[ 'bodyParams', { unknown: true }, 'UNKNOWN_BODY_PARAM', 'Unknown body parameter: unknown.' ],
		[
			'pathValues',
			{ $site: '', $comment_ID: 0, $unknown: 'x' },
			'UNKNOWN_PATH_PARAM',
			'Unknown path parameter: $unknown.',
		],
	] )( 'rejects unknown %s', async ( key, value, code, message ) => {
		const changed = {
			...config,
			request: {
				...config.request,
				[ key ]: value,
			},
		};
		const snapshot = JSON.parse( JSON.stringify( changed ) );

		await expect( resolveRequestConfig( changed, createDependencies() ) ).rejects.toMatchObject( {
			code,
			message,
		} );
		expect( changed ).toEqual( snapshot );
	} );

	it( 'rejects a missing canonical path value while allowing empty string and falsy values', async () => {
		const changed = {
			...config,
			request: {
				...config.request,
				pathValues: { $site: '', $comment_ID: undefined },
			},
		};

		await expect( resolveRequestConfig( changed, createDependencies() ) ).rejects.toMatchObject( {
			code: 'MISSING_PATH_VALUE',
			message: 'Missing path value: $comment_ID.',
		} );
	} );

	it( 'always rejects with typed request configuration errors', async () => {
		try {
			await resolveRequestConfig( config, createDependencies( {
				findApi: vi.fn( () => undefined ),
			} ) );
			throw new Error( 'Expected resolveRequestConfig to throw' );
		} catch ( error ) {
			expect( error ).toBeInstanceOf( RequestConfigError );
			expect( error ).toMatchObject( { code: 'UNKNOWN_API' } );
		}
	} );
} );
