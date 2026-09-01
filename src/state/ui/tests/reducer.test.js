import deepFreeze from 'deep-freeze';
import { vi } from 'vitest';

vi.mock( '../../../api', () => ( { getDefault: () => ( { name: 'WP.COM API' } ) } ) );

import reducer from '../reducer';
import { REQUEST_CONFIG_APPLY } from '../../actions';

it( 'atomically replaces api and version without merging old ui state', () => {
	const state = deepFreeze( {
		api: 'Old API',
		version: 'v1',
		theme: 'do-not-keep',
	} );
	const action = {
		type: REQUEST_CONFIG_APPLY,
		payload: {
			api: 'WP.COM API',
			version: null,
		},
	};

	expect( reducer( state, action ) ).toEqual( {
		api: 'WP.COM API',
		version: null,
	} );
} );
