import { vi } from 'vitest';

vi.mock( '../core', () => ( { default: vi.fn( () => ( { name: 'WP REST API' } ) ) } ) );
vi.mock( '../com', () => ( { default: vi.fn( () => ( { name: 'WP.COM API' } ) ) } ) );
vi.mock( '../../auth/oauth2', () => ( { default: vi.fn( () => ( { type: 'oauth2' } ) ) } ) );
vi.mock( '../../auth/oauth1', () => ( { default: vi.fn( () => ( { type: 'oauth1' } ) ) } ) );
vi.mock( '../../auth/basic', () => ( { default: vi.fn( () => ( { type: 'basic' } ) ) } ) );
vi.mock( '../../auth/proxy', () => ( { request: vi.fn() } ) );

import { findByName, get } from '../index';

describe( 'api index lookups', () => {
	it( 'should find an api by exact name', () => {
		expect( findByName( 'WP.COM API' ) ).toEqual( { name: 'WP.COM API' } );
		expect( findByName( 'WP REST API' ) ).toEqual( { name: 'WP REST API' } );
	} );

	it( 'should return undefined for unknown names', () => {
		expect( findByName( 'missing' ) ).toBeUndefined();
	} );

	it( 'should fall back to the default api when get misses', () => {
		expect( get( 'missing' ) ).toEqual( { name: 'WP.COM API' } );
		expect( get() ).toEqual( { name: 'WP.COM API' } );
	} );
} );
