import { vi } from 'vitest';

vi.mock( '../../../api', () => ( { get: vi.fn() } ) );
vi.mock( '../../../api/discovery', () => ( { fetchEndpoints: vi.fn() } ) );

import { API_ENDPOINTS_RECEIVE } from '../../actions';
import { get } from '../../../api';
import { fetchEndpoints } from '../../../api/discovery';
import { loadEndpoints } from '../actions';

describe( 'loadEndpoints', () => {
	it( 'should fetch, dispatch, and resolve endpoints', async () => {
		const api = { name: 'WP REST API' };
		const endpoints = [ { pathLabeled: '/test' } ];
		const dispatch = vi.fn();
		get.mockReturnValue( api );
		fetchEndpoints.mockResolvedValue( endpoints );

		await expect( loadEndpoints( 'WP REST API', 'wp/v2' )( dispatch ) ).resolves.toEqual(
			endpoints
		);
		expect( fetchEndpoints ).toHaveBeenCalledWith( api, 'wp/v2' );
		expect( dispatch ).toHaveBeenCalledWith( {
			type: API_ENDPOINTS_RECEIVE,
			payload: {
				apiName: 'WP REST API',
				version: 'wp/v2',
				endpoints,
			},
		} );
	} );

	it( 'should propagate fetch failures', async () => {
		const error = new Error( 'boom' );
		const dispatch = vi.fn();
		get.mockReturnValue( { name: 'WP REST API' } );
		fetchEndpoints.mockRejectedValue( error );

		await expect( loadEndpoints( 'WP REST API', 'wp/v2' )( dispatch ) ).rejects.toBe( error );
		expect( dispatch ).not.toHaveBeenCalled();
	} );
} );
