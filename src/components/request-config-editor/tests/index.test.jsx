import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { vi } from 'vitest';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock( 'react-simple-code-editor', () => ( {
	default: ( props ) => (
		<textarea
			aria-label={ props[ 'aria-label' ] }
			className={ props.textareaClassName }
			disabled={ props.disabled }
			value={ props.value }
			onChange={ ( event ) => props.onValueChange( event.target.value ) }
			onPaste={ props.onPaste }
		/>
	),
} ) );
vi.mock( '../../../state/request-config/actions', () => ( {
	applyRequestConfiguration: vi.fn(),
} ) );

import { createRequestConfig, formatRequestConfig } from '../../../request-config/codec';
import { RequestConfigEditor } from '../index';

const source = {
	api: 'WP.COM API',
	version: 'v1.1',
	endpoint: {
		method: 'GET',
		pathLabeled: '/me',
		request: { path: {}, query: {}, body: {} },
	},
	pathValues: {},
	queryParams: {},
	bodyParams: {},
};

const syncSource = {
	...source,
	endpoint: {
		...source.endpoint,
		pathLabeled: '/sites/$site/posts',
		request: {
			path: { $site: {} },
			query: { context: {} },
			body: { title: {} },
		},
	},
	pathValues: { $site: '123' },
	queryParams: { context: 'display' },
	bodyParams: { title: 'Hello' },
};

const findButton = ( container, label ) =>
	Array.from( container.querySelectorAll( 'button' ) ).find(
		( button ) => button.textContent === label
	);

const setTextAreaValue = ( textarea, value ) => {
	act( () => {
		Object.defineProperty( textarea, 'value', {
			configurable: true,
			value,
			writable: true,
		} );
		textarea.dispatchEvent( new Event( 'change', { bubbles: true } ) );
	} );
};

const advanceTimers = async ( milliseconds ) => {
	await act( async () => {
		vi.advanceTimersByTime( milliseconds );
		await Promise.resolve();
	} );
};

let container;
let root;

const unmountEditor = () => {
	if ( ! root ) {
		return;
	}

	act( () => root.unmount() );
	root = null;
};

beforeEach( () => {
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	root = createRoot( container );
	Object.defineProperty( navigator, 'clipboard', {
		configurable: true,
		value: { writeText: vi.fn( () => Promise.resolve() ) },
	} );
} );

afterEach( () => {
	unmountEditor();
	container.remove();
	vi.clearAllMocks();
	vi.useRealTimers();
} );

const renderEditor = ( props = {} ) => {
	act( () => {
		root.render(
			<RequestConfigEditor
				requestConfigSource={ source }
				applyRequestConfiguration={ vi.fn( () => Promise.resolve() ) }
				{ ...props }
			/>
		);
	} );
};

it( 'generates request JSON initially and ignores semantically equivalent rerenders', () => {
	renderEditor( { requestConfigSource: syncSource } );
	expect( container.querySelector( 'textarea' ).value ).toBe(
		formatRequestConfig( createRequestConfig( syncSource ) )
	);

	setTextAreaValue( container.querySelector( 'textarea' ), '{"manual":true}' );
	renderEditor( {
		requestConfigSource: {
			...syncSource,
			pathValues: { ...syncSource.pathValues },
		},
	} );

	expect( container.querySelector( 'textarea' ).value ).toBe( '{"manual":true}' );
} );

it( 'generates JSON without an error when path values are missing', () => {
	renderEditor( { requestConfigSource: { ...syncSource, pathValues: {} } } );

	expect( JSON.parse( container.querySelector( 'textarea' ).value ).request.pathValues ).toEqual( {
		$site: '',
	} );
	expect( container.querySelector( '[role="alert"]' ) ).toBeNull();
} );

it.each( [
	[ 'API', ( value ) => ( { ...value, api: 'WP.ORG API' } ) ],
	[ 'version', ( value ) => ( { ...value, version: 'v2' } ) ],
	[
		'endpoint',
		( value ) => ( {
			...value,
			endpoint: { ...value.endpoint, pathLabeled: '/sites/$site/pages' },
		} ),
	],
	[
		'path value',
		( value ) => ( { ...value, pathValues: { ...value.pathValues, $site: '456' } } ),
	],
	[
		'query value',
		( value ) => ( {
			...value,
			queryParams: { ...value.queryParams, context: 'edit' },
		} ),
	],
	[
		'body value',
		( value ) => ( { ...value, bodyParams: { ...value.bodyParams, title: 'Changed' } } ),
	],
] )( 'regenerates request JSON after a %s change', ( _label, change ) => {
	renderEditor( { requestConfigSource: syncSource } );
	setTextAreaValue( container.querySelector( 'textarea' ), '{"manual":true}' );

	const changedSource = change( syncSource );
	renderEditor( { requestConfigSource: changedSource } );

	expect( container.querySelector( 'textarea' ).value ).toBe(
		formatRequestConfig( createRequestConfig( changedSource ) )
	);
} );

it( 'does not automatically apply drafts generated from request state', async () => {
	vi.useFakeTimers();
	const applyRequestConfiguration = vi.fn( () => Promise.resolve() );
	renderEditor( { requestConfigSource: syncSource, applyRequestConfiguration } );

	renderEditor( {
		requestConfigSource: {
			...syncSource,
			queryParams: { ...syncSource.queryParams, context: 'edit' },
		},
		applyRequestConfiguration,
	} );
	await advanceTimers( 500 );

	expect( applyRequestConfiguration ).not.toHaveBeenCalled();
} );

it( 'formats valid JSON from the editor manually', () => {
	renderEditor();
	const textarea = container.querySelector( 'textarea' );
	setTextAreaValue( textarea, '{"b":2,"a":1}' );

	act( () => findButton( container, 'Format JSON' ).click() );

	expect( container.querySelector( 'textarea' ).value ).toBe( '{\n  "a": 1,\n  "b": 2\n}\n' );
} );

it( 'pastes valid JSON as formatted text and applies it after 500 ms', async () => {
	vi.useFakeTimers();
	const applyRequestConfiguration = vi.fn( () => Promise.resolve() );
	renderEditor( { applyRequestConfiguration } );
	const textarea = container.querySelector( 'textarea' );
	const event = new Event( 'paste', { bubbles: true, cancelable: true } );
	Object.defineProperty( event, 'clipboardData', {
		value: { getData: () => '{"b":2,"a":1}' },
	} );

	act( () => {
		textarea.dispatchEvent( event );
	} );

	expect( event.defaultPrevented ).toBe( true );
	expect( textarea.value ).toBe( '{\n  "a": 1,\n  "b": 2\n}\n' );
	expect( applyRequestConfiguration ).not.toHaveBeenCalled();

	await advanceTimers( 500 );
	expect( applyRequestConfiguration ).toHaveBeenCalledWith(
		'{\n  "a": 1,\n  "b": 2\n}\n',
		expect.any( Function )
	);
} );

it( 'preserves invalid pasted text and shows its apply error after 500 ms', async () => {
	vi.useFakeTimers();
	const applyRequestConfiguration = vi.fn( () => Promise.reject( new Error( 'Invalid JSON' ) ) );
	renderEditor( { applyRequestConfiguration } );
	const textarea = container.querySelector( 'textarea' );
	const event = new Event( 'paste', { bubbles: true, cancelable: true } );
	Object.defineProperty( event, 'clipboardData', {
		value: { getData: () => '{' },
	} );

	act( () => {
		textarea.dispatchEvent( event );
	} );

	expect( event.defaultPrevented ).toBe( true );
	expect( textarea.value ).toBe( '{' );
	expect( container.querySelector( '[role="alert"]' ) ).toBeNull();

	await advanceTimers( 500 );
	expect( container.querySelector( '[role="alert"]' ).textContent ).toBe( 'Invalid JSON' );
	expect( textarea.value ).toBe( '{' );
} );

it( 'copies deterministic formatted JSON and updates the draft after success', async () => {
	renderEditor();
	setTextAreaValue( container.querySelector( 'textarea' ), '{"b":2,"a":1}' );

	await act( async () => {
		findButton( container, 'Copy JSON' ).click();
		await Promise.resolve();
	} );

	expect( navigator.clipboard.writeText ).toHaveBeenCalledWith( '{\n  "a": 1,\n  "b": 2\n}\n' );
	expect( container.querySelector( 'textarea' ).value ).toBe( '{\n  "a": 1,\n  "b": 2\n}\n' );
} );

it( 'copies deterministic formatted JSON as a GitHub Markdown code fence', async () => {
	renderEditor();
	setTextAreaValue( container.querySelector( 'textarea' ), '{"b":2,"a":1}' );

	await act( async () => {
		findButton( container, 'Copy Markdown' ).click();
		await Promise.resolve();
	} );

	expect( navigator.clipboard.writeText ).toHaveBeenCalledWith(
		'```json\n{\n  "a": 1,\n  "b": 2\n}\n```\n'
	);
	expect( container.querySelector( 'textarea' ).value ).toBe( '{"b":2,"a":1}' );
} );

it( 'does not copy invalid JSON and reports a parse error', async () => {
	renderEditor();
	setTextAreaValue( container.querySelector( 'textarea' ), '{' );

	await act( async () => {
		findButton( container, 'Copy JSON' ).click();
		await Promise.resolve();
	} );

	expect( navigator.clipboard.writeText ).not.toHaveBeenCalled();
	expect( container.querySelector( '[role="alert"]' ).textContent ).toMatch(
		/Unexpected end|JSON/
	);
	expect( container.querySelector( 'textarea' ).value ).toBe( '{' );
} );

it( 'reports clipboard failures and preserves the exact editor text', async () => {
	navigator.clipboard.writeText.mockRejectedValueOnce( new Error( 'blocked' ) );
	renderEditor();
	setTextAreaValue( container.querySelector( 'textarea' ), '{"a":1}' );

	await act( async () => {
		findButton( container, 'Copy JSON' ).click();
		await Promise.resolve();
	} );

	expect( navigator.clipboard.writeText ).toHaveBeenCalledWith( '{\n  "a": 1\n}\n' );
	expect( container.querySelector( '[role="alert"]' ).textContent ).toBe( 'blocked' );
	expect( container.querySelector( 'textarea' ).value ).toBe( '{"a":1}' );
} );

it( 'does not warn when copy completes after unmount', async () => {
	const errorSpy = vi.spyOn( console, 'error' ).mockImplementation( () => {} );
	let resolveCopy;
	navigator.clipboard.writeText.mockImplementationOnce(
		() =>
			new Promise( ( resolve ) => {
				resolveCopy = resolve;
			} )
	);

	renderEditor();
	setTextAreaValue( container.querySelector( 'textarea' ), '{"a":1}' );

	await act( async () => {
		findButton( container, 'Copy JSON' ).click();
		await Promise.resolve();
	} );
	unmountEditor();

	await act( async () => {
		resolveCopy();
		await Promise.resolve();
	} );

	expect( errorSpy ).not.toHaveBeenCalled();
	errorSpy.mockRestore();
} );

it( 'debounces manual edits for 500 ms without submitting or disabling the editor', async () => {
	vi.useFakeTimers();
	const applyRequestConfiguration = vi.fn( () => Promise.resolve() );
	const request = vi.fn();
	renderEditor( { applyRequestConfiguration, request } );
	const textarea = container.querySelector( 'textarea' );

	setTextAreaValue( textarea, '{"first":true}' );
	await advanceTimers( 400 );
	setTextAreaValue( textarea, '{"second":true}' );
	await advanceTimers( 100 );
	expect( applyRequestConfiguration ).not.toHaveBeenCalled();

	await advanceTimers( 400 );
	expect( applyRequestConfiguration ).toHaveBeenCalledTimes( 1 );
	expect( applyRequestConfiguration ).toHaveBeenCalledWith(
		'{"second":true}',
		expect.any( Function )
	);
	expect( request ).not.toHaveBeenCalled();
	expect( textarea.disabled ).toBe( false );
} );

it( 'invalidates an in-flight apply as soon as a newer edit is typed', async () => {
	vi.useFakeTimers();
	let resolveFirst;
	const applyRequestConfiguration = vi
		.fn()
		.mockImplementationOnce(
			() =>
				new Promise( resolve => {
					resolveFirst = resolve;
				} )
		)
		.mockResolvedValueOnce();
	renderEditor( { applyRequestConfiguration } );
	const textarea = container.querySelector( 'textarea' );

	setTextAreaValue( textarea, '{"first":true}' );
	await advanceTimers( 500 );
	const isFirstCurrent = applyRequestConfiguration.mock.calls[ 0 ][ 1 ];
	expect( isFirstCurrent() ).toBe( true );

	setTextAreaValue( textarea, '{"second":true}' );
	expect( isFirstCurrent() ).toBe( false );
	expect( applyRequestConfiguration ).toHaveBeenCalledTimes( 1 );

	await act( async () => {
		resolveFirst();
		await Promise.resolve();
	} );
	await advanceTimers( 500 );

	expect( applyRequestConfiguration ).toHaveBeenCalledTimes( 2 );
	expect( applyRequestConfiguration ).toHaveBeenLastCalledWith(
		'{"second":true}',
		expect.any( Function )
	);
} );

it( 'ignores stale apply errors after a newer edit succeeds', async () => {
	vi.useFakeTimers();
	let rejectFirst;
	const applyRequestConfiguration = vi
		.fn()
		.mockImplementationOnce(
			() =>
				new Promise( ( _resolve, reject ) => {
					rejectFirst = reject;
				} )
		)
		.mockResolvedValueOnce();
	renderEditor( { applyRequestConfiguration } );
	const textarea = container.querySelector( 'textarea' );

	setTextAreaValue( textarea, '{"first":true}' );
	await advanceTimers( 500 );
	setTextAreaValue( textarea, '{"second":true}' );
	await advanceTimers( 500 );

	await act( async () => {
		rejectFirst( new Error( 'stale failure' ) );
		await Promise.resolve();
	} );

	expect( applyRequestConfiguration ).toHaveBeenCalledTimes( 2 );
	expect( container.querySelector( '[role="alert"]' ) ).toBeNull();
	expect( textarea.value ).toBe( '{"second":true}' );
} );

it( 'clears pending automatic apply work when unmounted', async () => {
	vi.useFakeTimers();
	const errorSpy = vi.spyOn( console, 'error' ).mockImplementation( () => {} );
	const applyRequestConfiguration = vi.fn( () => Promise.resolve() );
	renderEditor( { applyRequestConfiguration } );
	setTextAreaValue( container.querySelector( 'textarea' ), '{"a":1}' );

	unmountEditor();
	await advanceTimers( 500 );

	expect( applyRequestConfiguration ).not.toHaveBeenCalled();
	expect( errorSpy ).not.toHaveBeenCalled();
	errorSpy.mockRestore();
} );

it( 'ignores an in-flight automatic apply failure after unmount', async () => {
	vi.useFakeTimers();
	const errorSpy = vi.spyOn( console, 'error' ).mockImplementation( () => {} );
	let rejectApply;
	const applyRequestConfiguration = vi.fn(
		() =>
			new Promise( ( _resolve, reject ) => {
				rejectApply = reject;
			} )
	);
	renderEditor( { applyRequestConfiguration } );
	setTextAreaValue( container.querySelector( 'textarea' ), '{"a":1}' );
	await advanceTimers( 500 );
	unmountEditor();

	await act( async () => {
		rejectApply( new Error( 'late failure' ) );
		await Promise.resolve();
	} );

	expect( errorSpy ).not.toHaveBeenCalled();
	errorSpy.mockRestore();
} );
