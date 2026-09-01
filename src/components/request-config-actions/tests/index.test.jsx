import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { vi } from 'vitest';

vi.mock( '@wordpress/components', () => ( {
	Button: ( { children, disabled, onClick } ) => (
		<button disabled={ disabled } onClick={ onClick } type="button">
			{ children }
		</button>
	),
	Modal: ( { children, onRequestClose, title } ) => (
		<section aria-label={ title } role="dialog">
			<button aria-label="Close modal" onClick={ onRequestClose } type="button" />
			{ children }
		</section>
	),
	Tooltip: ( { children, text } ) => <span data-tooltip-text={ text }>{ children }</span>,
} ) );

vi.mock( 'react-simple-code-editor', () => ( {
	default: ( { onValueChange, readOnly, value } ) => (
		<textarea
			aria-label={ readOnly ? 'Shared request JSON' : 'Import request JSON' }
			readOnly={ readOnly }
			value={ value }
			onChange={ ( event ) => onValueChange( event.target.value ) }
		/>
	),
} ) );

vi.mock( '../../../state/request-config/actions', () => ( {
	applyRequestConfiguration: vi.fn(),
} ) );
vi.mock( '../../../state/request-config/selectors', () => ( {
	getRequestConfigSource: vi.fn(),
} ) );

import { RequestConfigActions } from '../index';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const requestConfigSource = {
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

const findButton = ( container, label ) =>
	Array.from( container.querySelectorAll( 'button' ) ).find(
		( button ) => button.textContent === label
	);

const changeTextArea = ( textarea, value ) => {
	Object.getOwnPropertyDescriptor( HTMLTextAreaElement.prototype, 'value' ).set.call(
		textarea,
		value
	);
	textarea.dispatchEvent( new Event( 'change', { bubbles: true } ) );
};

let container;
let root;

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
	act( () => root.unmount() );
	container.remove();
	vi.clearAllMocks();
} );

const renderActions = ( props = {} ) => {
	const mergedProps = {
		applyRequestConfiguration: vi.fn( () => Promise.resolve() ),
		requestConfigSource,
		...props,
	};

	act( () => root.render( <RequestConfigActions { ...mergedProps } /> ) );
	return mergedProps;
};

it( 'keeps Import available and disables Share without a selected endpoint', () => {
	renderActions( { requestConfigSource: { ...requestConfigSource, endpoint: undefined } } );

	const shareButton = findButton( container, 'Share' );
	const importButton = findButton( container, 'Import' );

	expect( shareButton.disabled ).toBe( true );
	expect( importButton.disabled ).toBe( false );
	expect( shareButton.closest( '[data-tooltip-text]' ).dataset.tooltipText ).toBe(
		'Copy this request configuration'
	);
	expect( importButton.closest( '[data-tooltip-text]' ).dataset.tooltipText ).toBe(
		'Load a request configuration from JSON'
	);
} );

it( 'copies JSON and GitHub Markdown with feedback inside the active button', async () => {
	renderActions();

	act( () => findButton( container, 'Share' ).click() );
	const dialog = container.querySelector( '[role="dialog"]' );
	const editor = dialog.querySelector( '[aria-label="Shared request JSON"]' );

	expect( dialog.getAttribute( 'aria-label' ) ).toBe( 'Share request configuration' );
	expect( editor.readOnly ).toBe( true );
	expect( JSON.parse( editor.value ) ).toMatchObject( {
		schemaVersion: 1,
		request: { api: 'WP.COM API', version: 'v1.1', method: 'GET', endpoint: '/me' },
	} );

	await act( async () => {
		findButton( dialog, 'Copy JSON' ).click();
		await Promise.resolve();
	} );

	expect( navigator.clipboard.writeText ).toHaveBeenCalledWith( editor.value );
	expect( findButton( dialog, 'Copied' ) ).not.toBeNull();
	expect( dialog.querySelector( '[role="status"]' ) ).toBeNull();

	await act( async () => {
		findButton( dialog, 'Copy Markdown' ).click();
		await Promise.resolve();
	} );

	expect( navigator.clipboard.writeText ).toHaveBeenLastCalledWith(
		'### Import this request in the API Console\n\n' +
			'Open https://developer.wordpress.com/docs/api/console/, click **Import**, and paste this JSON:\n\n' +
			'```json\n' +
			editor.value +
			'```\n'
	);
	expect( findButton( dialog, 'Copy JSON' ) ).not.toBeNull();
	expect( findButton( dialog, 'Copied' ) ).not.toBeNull();
} );

it( 'keeps the Import modal open and reports apply errors', async () => {
	const applyRequestConfiguration = vi.fn( () =>
		Promise.reject( new Error( 'Unknown endpoint' ) )
	);
	renderActions( { applyRequestConfiguration } );

	act( () => findButton( container, 'Import' ).click() );
	const dialog = container.querySelector( '[role="dialog"]' );
	const editor = dialog.querySelector( '[aria-label="Import request JSON"]' );
	act( () => changeTextArea( editor, '{"schemaVersion":1}' ) );

	await act( async () => {
		findButton( dialog, 'Import' ).click();
		await Promise.resolve();
	} );

	expect( applyRequestConfiguration ).toHaveBeenCalledWith( '{"schemaVersion":1}' );
	expect( container.querySelector( '[role="dialog"]' ) ).not.toBeNull();
	expect( container.querySelector( '[role="alert"]' ).textContent ).toBe( 'Unknown endpoint' );
} );

it( 'applies imported JSON only after confirmation and closes on success', async () => {
	const applyRequestConfiguration = vi.fn( () => Promise.resolve() );
	renderActions( { applyRequestConfiguration } );

	act( () => findButton( container, 'Import' ).click() );
	const dialog = container.querySelector( '[role="dialog"]' );
	const editor = dialog.querySelector( '[aria-label="Import request JSON"]' );
	act( () => changeTextArea( editor, '{"schemaVersion":1}' ) );

	expect( applyRequestConfiguration ).not.toHaveBeenCalled();
	await act( async () => {
		findButton( dialog, 'Import' ).click();
		await Promise.resolve();
	} );

	expect( applyRequestConfiguration ).toHaveBeenCalledWith( '{"schemaVersion":1}' );
	expect( container.querySelector( '[role="dialog"]' ) ).toBeNull();
} );
