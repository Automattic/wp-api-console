import { serialize } from '../cache';

describe( 'serialize', () => {
	it( 'should not modify the original object', () => {
		// Otherwise we get this error sometimes:
		// Unexpected keys "_timestamp", "_version" found in previous state
		const state = {};
		const dummyReducer = state => state;

		const serialized = serialize( state, dummyReducer );
		expect( serialized._timestamp ).toBeGreaterThan( 0 );

		expect( state._timestamp ).toBeUndefined();
	} );
} );
