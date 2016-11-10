import deepFreeze from 'deep-freeze';

import reducer from '../reducer';
import { API_ENDPOINTS_RECEIVE } from '../../actions';

const endpoints = [
	{ path_labeled: 'myEndpoint' },
];
const state = deepFreeze( {
	wpcom: {
		v1: endpoints,
	},
} );

it( 'should return old state on unknown actions', () => {
	const action = { type: 'test' };

	expect( reducer( state, action ) ).toEqual( state );
} );

it( 'should append endpoint to a new version', () => {
	const newEndpoints = [ { path_labeled: 'mynewEndpoint' } ];
	const action = {
		type: API_ENDPOINTS_RECEIVE,
		payload: {
			apiName: 'wpcom',
			version: 'v2',
			endpoints: newEndpoints,
		},
	};

	expect( reducer( state, action ) ).toEqual( {
		wpcom: {
			v1: endpoints,
			v2: newEndpoints,
		},
	} );
} );

it( 'should append endpoint to a new api', () => {
	const newEndpoints = [ { path_labeled: 'mynewEndpoint' } ];
	const action = {
		type: API_ENDPOINTS_RECEIVE,
		payload: {
			apiName: 'wporg',
			version: 'v1',
			endpoints: newEndpoints,
		},
	};

	expect( reducer( state, action ) ).toEqual( {
		wpcom: {
			v1: endpoints,
		},
		wporg: {
			v1: newEndpoints,
		},
	} );
} );

it( 'should replace endpoints for the same api and version', () => {
	const newEndpoints = [ { path_labeled: 'mynewEndpoint' } ];
	const action = {
		type: API_ENDPOINTS_RECEIVE,
		payload: {
			apiName: 'wpcom',
			version: 'v1',
			endpoints: newEndpoints,
		},
	};

	expect( reducer( state, action ) ).toEqual( {
		wpcom: {
			v1: newEndpoints,
		},
	} );
} );
