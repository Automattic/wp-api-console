import { vi } from 'vitest';

vi.mock( '../app', () => ( { default: () => null } ) );
vi.mock( '../v2/app', () => ( { default: () => null } ) );

import { getAppVersion } from '../root-app';

it.each( [ '/v2', '/v2/' ] )( 'selects V2 for %s', pathname => {
	expect( getAppVersion( pathname ) ).toBe( 'v2' );
} );

it.each( [ '/', '/anything-else', '/v2/anything-else' ] )( 'keeps V1 for %s', pathname => {
	expect( getAppVersion( pathname ) ).toBe( 'v1' );
} );
