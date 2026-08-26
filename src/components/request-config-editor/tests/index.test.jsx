import fs from 'node:fs';
import path from 'node:path';

import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { vi } from 'vitest';

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
	Object.defineProperty( textarea, 'value', {
		configurable: true,
		value,
		writable: true,
	} );
	textarea.dispatchEvent( new Event( 'change', { bubbles: true } ) );
};

let container;

beforeEach( () => {
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	Object.defineProperty( navigator, 'clipboard', {
		configurable: true,
		value: { writeText: vi.fn( () => Promise.resolve() ) },
	} );
} );

afterEach( () => {
	ReactDOM.unmountComponentAtNode( container );
	container.remove();
	vi.clearAllMocks();
} );

const renderEditor = ( props = {} ) => {
	act( () => {
		ReactDOM.render(
			<RequestConfigEditor
				requestConfigSource={ source }
				applyRequestConfiguration={ vi.fn( () => Promise.resolve() ) }
				{ ...props }
			/>,
			container
		);
	} );
};

it( 'defines a visible keyboard focus fallback and suppresses mouse-only focus when supported', () => {
	const css = fs.readFileSync( path.resolve( 'src/components/request-config-editor/style.css' ), 'utf8' );

	expect( css ).toContain( '.request-config-editor__code textarea:focus,' );
	expect( css ).toContain( '.request-config-editor__actions button:focus {' );
	expect( css ).toContain( '@supports selector(:focus-visible)' );
	expect( css ).toContain( 'textarea:focus:not(:focus-visible)' );
	expect( css ).toContain( 'button:focus:not(:focus-visible)' );
	expect( css ).not.toContain( '@supports not selector(:focus-visible)' );
} );

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
] )( 'regenerates request JSON after a %s change', ( label, change ) => {
	renderEditor( { requestConfigSource: syncSource } );
	setTextAreaValue( container.querySelector( 'textarea' ), '{"manual":true}' );

	const changedSource = change( syncSource );
	renderEditor( { requestConfigSource: changedSource } );

	expect( container.querySelector( 'textarea' ).value ).toBe(
		formatRequestConfig( createRequestConfig( changedSource ) )
	);
} );

it( 'formats valid JSON from the editor manually', () => {
	renderEditor();
	const textarea = container.querySelector( 'textarea' );
	setTextAreaValue( textarea, '{"b":2,"a":1}' );

	act( () => findButton( container, 'Format JSON' ).click() );

	expect( container.querySelector( 'textarea' ).value ).toBe( '{\n  "a": 1,\n  "b": 2\n}\n' );
} );

it( 'pastes valid JSON as formatted text and prevents the browser default', () => {
	renderEditor();
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
	expect( container.querySelector( '[role="alert"]' ) ).toBeNull();
} );

it( 'preserves invalid pasted text and shows a parse error', () => {
	renderEditor();
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
	expect( container.querySelector( '[role="alert"]' ).textContent ).toMatch(
		/Unexpected end|JSON/
	);
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
	ReactDOM.unmountComponentAtNode( container );

	await act( async () => {
		resolveCopy();
		await Promise.resolve();
	} );

	expect( errorSpy ).not.toHaveBeenCalled();
	errorSpy.mockRestore();
} );

it( 'applies the current draft, disables duplicate applies while pending, and does not trigger submit', async () => {
	const request = vi.fn();
	let resolveApply;
	const applyRequestConfiguration = vi.fn(
		() =>
			new Promise( ( resolve ) => {
				resolveApply = resolve;
			} )
	);

	renderEditor( { applyRequestConfiguration, request } );
	setTextAreaValue( container.querySelector( 'textarea' ), '{"a":1}' );

	const applyButton = findButton( container, 'Apply to request' );
	await act( async () => {
		applyButton.click();
		await Promise.resolve();
	} );

	expect( applyRequestConfiguration ).toHaveBeenCalledTimes( 1 );
	expect( applyRequestConfiguration ).toHaveBeenCalledWith( '{"a":1}' );
	expect( applyButton.disabled ).toBe( true );

	await act( async () => {
		applyButton.click();
		await Promise.resolve();
	} );
	expect( applyRequestConfiguration ).toHaveBeenCalledTimes( 1 );
	expect( request ).not.toHaveBeenCalled();

	await act( async () => {
		resolveApply();
		await Promise.resolve();
	} );

	expect( applyButton.disabled ).toBe( false );
	expect( container.querySelector( 'textarea' ).value ).toBe( '{"a":1}' );
} );

it( 'does not warn when apply completes after unmount', async () => {
	const errorSpy = vi.spyOn( console, 'error' ).mockImplementation( () => {} );
	let resolveApply;
	const applyRequestConfiguration = vi.fn(
		() =>
			new Promise( ( resolve ) => {
				resolveApply = resolve;
			} )
	);

	renderEditor( { applyRequestConfiguration } );
	setTextAreaValue( container.querySelector( 'textarea' ), '{"a":1}' );

	await act( async () => {
		findButton( container, 'Apply to request' ).click();
		await Promise.resolve();
	} );
	ReactDOM.unmountComponentAtNode( container );

	await act( async () => {
		resolveApply();
		await Promise.resolve();
	} );

	expect( errorSpy ).not.toHaveBeenCalled();
	errorSpy.mockRestore();
} );

it( 'reports apply failures and keeps the draft intact', async () => {
	const applyRequestConfiguration = vi.fn( () => Promise.reject( new Error( 'apply failed' ) ) );

	renderEditor( { applyRequestConfiguration } );
	setTextAreaValue( container.querySelector( 'textarea' ), '{"a":1}' );

	await act( async () => {
		findButton( container, 'Apply to request' ).click();
		await Promise.resolve();
	} );

	expect( container.querySelector( '[role="alert"]' ).textContent ).toBe( 'apply failed' );
	expect( container.querySelector( 'textarea' ).value ).toBe( '{"a":1}' );
} );
