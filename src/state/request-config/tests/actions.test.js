import { vi } from 'vitest';

vi.mock( '../../security/actions', () => ( { boot: vi.fn() } ) );
vi.mock( '../../../request-config/codec', () => ( { parseRequestConfig: vi.fn() } ) );
vi.mock( '../../../request-config/resolve', () => ( { resolveRequestConfig: vi.fn() } ) );

import { REQUEST_CONFIG_APPLY, REQUEST_TRIGGER } from '../../actions';
import { createApplyRequestConfiguration } from '../actions';

describe( 'createApplyRequestConfiguration', () => {
	it( 'parses, resolves, applies once, then boots authentication', async () => {
		const resolved = {
			api: 'WP.COM API',
			version: 'v1.1',
			endpoint: { method: 'POST' },
			pathValues: { $site: '' },
			queryParams: { status: false },
			bodyParams: { content: 0 },
		};
		const sequence = [];
		const parseRequestConfig = vi.fn( text => ({ schemaVersion: 1, text }) );
		const resolveRequestConfig = vi.fn( async config => resolved );
		const bootAction = { type: 'BOOT_AUTH', payload: resolved.api };
		const boot = vi.fn( apiName => {
			sequence.push( { kind: 'boot', apiName } );
			return bootAction;
		} );
		const dispatch = vi.fn( action => {
			sequence.push( { kind: 'dispatch', action } );
			return action;
		} );
		const apply = createApplyRequestConfiguration( {
			parseRequestConfig,
			resolveRequestConfig,
			boot,
		} );

		await expect( apply( '{"schemaVersion":1}' )( dispatch ) ).resolves.toBe( resolved );
		expect( parseRequestConfig ).toHaveBeenCalledWith( '{"schemaVersion":1}' );
		expect( resolveRequestConfig ).toHaveBeenCalledWith( { schemaVersion: 1, text: '{"schemaVersion":1}' } );
		expect( boot ).toHaveBeenCalledWith( 'WP.COM API' );
		expect( sequence ).toEqual( [
			{
				kind: 'dispatch',
				action: {
					type: REQUEST_CONFIG_APPLY,
					payload: resolved,
				},
			},
			{
				kind: 'boot',
				apiName: 'WP.COM API',
			},
			{
				kind: 'dispatch',
				action: bootAction,
			},
		] );
		expect( sequence[ 0 ].action.payload ).toBe( resolved );
		expect( dispatch.mock.calls.map( ( [ action ] ) => action.type ) ).not.toContain( REQUEST_TRIGGER );
	} );

	it( 'dispatches nothing when parsing fails', async () => {
		const error = new Error( 'invalid configuration' );
		const parseRequestConfig = vi.fn( () => {
			throw error;
		} );
		const resolveRequestConfig = vi.fn();
		const boot = vi.fn();
		const dispatch = vi.fn();
		const apply = createApplyRequestConfiguration( {
			parseRequestConfig,
			resolveRequestConfig,
			boot,
		} );

		await expect( apply( '{' )( dispatch ) ).rejects.toBe( error );
		expect( resolveRequestConfig ).not.toHaveBeenCalled();
		expect( boot ).not.toHaveBeenCalled();
		expect( dispatch ).not.toHaveBeenCalled();
	} );

	it( 'dispatches nothing on async resolution failure', async () => {
		const parsed = { schemaVersion: 1 };
		const error = new Error( 'resolve failed' );
		const parseRequestConfig = vi.fn( () => parsed );
		const resolveRequestConfig = vi.fn( () => Promise.reject( error ) );
		const boot = vi.fn();
		const dispatch = vi.fn();
		const apply = createApplyRequestConfiguration( {
			parseRequestConfig,
			resolveRequestConfig,
			boot,
		} );

		await expect( apply( '{}' )( dispatch ) ).rejects.toBe( error );
		expect( parseRequestConfig ).toHaveBeenCalledWith( '{}' );
		expect( resolveRequestConfig ).toHaveBeenCalledWith( parsed );
		expect( boot ).not.toHaveBeenCalled();
		expect( dispatch ).not.toHaveBeenCalled();
	} );
} );
