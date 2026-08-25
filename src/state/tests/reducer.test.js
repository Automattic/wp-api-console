import deepFreeze from 'deep-freeze';
import { vi } from 'vitest';

vi.mock( '../../api', () => ( { getDefault: () => ( { name: 'WP.COM API' } ) } ) );

import reducer from '../reducer';
import { REQUEST_CONFIG_APPLY } from '../actions';

it( 'keeps unrelated slices unchanged when applying a request configuration', () => {
	const endpoints = { wpcom: { v1: [ { pathLabeled: '/existing-endpoint' } ] } };
	const history = { wpcom: { v1: [ { pathLabeled: '/historical-endpoint' } ] } };
	const results = { 1: { id: 1, status: 200 } };
	const security = { wpcom: { ready: true, isLoggedin: true, user: { id: 1 } } };
	const versions = { wpcom: [ 'v1' ] };
	const state = deepFreeze( {
		endpoints,
		history,
		request: {
			method: 'GET',
			endpoint: false,
			pathValues: { old: 'value' },
			url: '/old',
			queryParams: { old: 'value' },
			bodyParams: { old: 'value' },
		},
		results,
		security,
		ui: { api: 'Old API', version: 'v1' },
		versions,
	} );
	const endpoint = {
		method: 'POST',
		pathLabeled: '/sites/$site/comments/new',
		request: {
			path: { $site: {} },
			query: { status: {} },
			body: { content: {} },
		},
	};
	const action = {
		type: REQUEST_CONFIG_APPLY,
		payload: {
			api: 'WP.COM API',
			version: 'v1.1',
			endpoint,
			pathValues: { $site: '' },
			queryParams: { status: false },
			bodyParams: { content: 0 },
		},
	};

	const nextState = reducer( state, action );

	expect( nextState.ui ).toEqual( { api: 'WP.COM API', version: 'v1.1' } );
	expect( nextState.request ).toEqual( {
		method: 'POST',
		endpoint,
		pathValues: { $site: '' },
		url: '',
		queryParams: { status: false },
		bodyParams: { content: 0 },
	} );
	expect( nextState.endpoints ).toBe( endpoints );
	expect( nextState.history ).toBe( history );
	expect( nextState.results ).toBe( results );
	expect( nextState.security ).toBe( security );
	expect( nextState.versions ).toBe( versions );
} );
