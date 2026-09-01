import { vi } from 'vitest';

import { fetchEndpoints } from '../discovery';

describe( 'fetchEndpoints', () => {
	it( 'should request discovery data and parse the response', async () => {
		const api = {
			getDiscoveryUrl: vi.fn( () => '/discovery/v1' ),
			parseEndpoints: vi.fn( ( body ) => [ { body } ] ),
		};
		const then = vi.fn( ( callback ) =>
			Promise.resolve().then( () => callback( { body: { routes: {} } } ) )
		);
		const set = vi.fn( () => ( { then } ) );
		const http = {
			get: vi.fn( () => ( { set } ) ),
		};

		await expect( fetchEndpoints( api, 'v1', http ) ).resolves.toEqual( [
			{ body: { routes: {} } },
		] );
		expect( http.get ).toHaveBeenCalledWith( '/discovery/v1' );
		expect( set ).toHaveBeenCalledWith( 'accept', 'application/json' );
		expect( api.parseEndpoints ).toHaveBeenCalledWith( { routes: {} } );
	} );

	it( 'should reject when the request fails', async () => {
		const error = new Error( 'network failed' );
		const api = {
			getDiscoveryUrl: vi.fn( () => '/discovery/v1' ),
			parseEndpoints: vi.fn(),
		};
		const http = {
			get: vi.fn( () => ( {
				set: vi.fn( () => ( {
					then: vi.fn( () => Promise.reject( error ) ),
				} ) ),
			} ) ),
		};

		await expect( fetchEndpoints( api, 'v1', http ) ).rejects.toBe( error );
		expect( api.parseEndpoints ).not.toHaveBeenCalled();
	} );

	it( 'should reject when parsing fails', async () => {
		const error = new Error( 'parse failed' );
		const api = {
			getDiscoveryUrl: vi.fn( () => '/discovery/v1' ),
			parseEndpoints: vi.fn( () => {
				throw error;
			} ),
		};
		const http = {
			get: vi.fn( () => ( {
				set: vi.fn( () => ( {
					then: vi.fn( ( callback ) => Promise.resolve().then( () => callback( { body: {} } ) ) ),
				} ) ),
			} ) ),
		};

		await expect( fetchEndpoints( api, 'v1', http ) ).rejects.toBe( error );
	} );
} );
