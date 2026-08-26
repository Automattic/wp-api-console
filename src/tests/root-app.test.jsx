import { vi } from 'vitest';

const { v2ModuleFactory } = vi.hoisted( () => ( {
	v2ModuleFactory: vi.fn( () => ( { default: () => null } ) ),
} ) );

vi.mock( '../app', () => ( { default: () => null } ) );
vi.mock( '../v2/app', v2ModuleFactory );

import { getAppVersion } from '../root-app';

it( 'does not load the V2 bundle while selecting V1', () => {
	expect( getAppVersion( '/' ) ).toBe( 'v1' );
	expect( v2ModuleFactory ).not.toHaveBeenCalled();
} );

it.each( [ '/v2', '/v2/' ] )( 'selects V2 for %s', pathname => {
	expect( getAppVersion( pathname ) ).toBe( 'v2' );
} );

it.each( [ '/', '/anything-else', '/v2/anything-else' ] )( 'keeps V1 for %s', pathname => {
	expect( getAppVersion( pathname ) ).toBe( 'v1' );
} );
