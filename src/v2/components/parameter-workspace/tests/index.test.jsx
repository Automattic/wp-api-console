import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { vi } from 'vitest';

vi.mock( '@wordpress/components', () => ( {
	Button: ( { children, ...props } ) => <button { ...props }>{ children }</button>,
	Card: ( { children, ...props } ) => <section { ...props }>{ children }</section>,
	CardBody: ( { children, ...props } ) => <div { ...props }>{ children }</div>,
	CardHeader: ( { children, ...props } ) => <header { ...props }>{ children }</header>,
	FormTokenField: ( { label, value, onChange } ) => (
		<input
			aria-label={ label }
			data-control="tokens"
			data-value={ JSON.stringify( value ) }
			value={ value.join( ', ' ) }
			onChange={ ( event ) => onChange( event.target.value.split( ', ' ).filter( Boolean ) ) }
		/>
	),
	__experimentalNumberControl: ( { label, value, onChange } ) => (
		<input
			aria-label={ label }
			data-control="number"
			type="number"
			value={ value }
			onChange={ ( event ) => onChange( event.target.value ) }
		/>
	),
	TabPanel: ( { children, initialTabName, tabs } ) => {
		const [ selected, setSelected ] = useState( initialTabName );
		const tab = tabs.find( ( item ) => item.name === selected );
		return (
			<div>
				<div role="tablist">
					{ tabs.map( ( item ) => (
						<button
							aria-selected={ item.name === selected }
							key={ item.name }
							onClick={ () => setSelected( item.name ) }
							role="tab"
						>
							{ item.title }
						</button>
					) ) }
				</div>
				{ children( tab ) }
			</div>
		);
	},
	TextControl: ( { label, value, onChange } ) => (
		<input
			aria-label={ label }
			data-control="text"
			value={ value }
			onChange={ ( event ) => onChange( event.target.value ) }
		/>
	),
	ToggleControl: ( { checked, label, onChange } ) => (
		<input
			aria-label={ label }
			checked={ checked }
			data-control="boolean"
			type="checkbox"
			onChange={ ( event ) => onChange( event.target.checked ) }
		/>
	),
} ) );

import { ParameterWorkspace } from '../index';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const endpoint = {
	request: {
		path: { $site: { type: 'string' } },
		query: {
			enabled: { type: 'boolean' },
			count: { type: 'integer' },
			ratio: { type: 'number' },
			tags: { type: 'array' },
			context: { type: 'string' },
		},
		body: { title: { type: 'string' } },
	},
};

let container;
let root;

beforeEach( () => {
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	root = createRoot( container );
} );

afterEach( () => {
	act( () => root.unmount() );
	container.remove();
	vi.clearAllMocks();
} );

const renderWorkspace = ( props = {} ) => {
	const defaultProps = {
		bodyParams: {},
		endpoint,
		queryParams: {
			enabled: false,
			count: 0,
			ratio: 1.5,
			tags: [ 'one', 'two' ],
			context: 'display',
		},
		setBodyParam: vi.fn(),
		setQueryParam: vi.fn(),
	};
	const mergedProps = { ...defaultProps, ...props };
	act( () => root.render( <ParameterWorkspace { ...mergedProps } /> ) );
	return mergedProps;
};

const changeInput = ( input, value ) => {
	act( () => {
		Object.getOwnPropertyDescriptor( HTMLInputElement.prototype, 'value' ).set.call( input, value );
		input.dispatchEvent( new Event( 'change', { bubbles: true } ) );
	} );
};

it( 'shows only Query and Body tabs because Path remains in the V1 header', () => {
	renderWorkspace();

	expect(
		Array.from( container.querySelectorAll( '[role="tab"]' ), ( tab ) => tab.textContent )
	).toEqual( [ 'Query', 'Body' ] );
	expect( container.textContent ).not.toContain( 'Path' );
} );

it( 'renders static type badges and preserves false, zero, and array values', () => {
	renderWorkspace();

	const booleanControl = container.querySelector( '[data-control="boolean"]' );
	const integerControl = container.querySelector( '[aria-label="count"]' );
	const numberControl = container.querySelector( '[aria-label="ratio"]' );
	const arrayControl = container.querySelector( '[data-control="tokens"]' );

	expect( booleanControl.checked ).toBe( false );
	expect( integerControl.dataset.control ).toBe( 'number' );
	expect( integerControl.value ).toBe( '0' );
	expect( numberControl.dataset.control ).toBe( 'number' );
	expect( numberControl.value ).toBe( '1.5' );
	expect( arrayControl.dataset.value ).toBe( '["one","two"]' );
	expect( container.querySelector( '[data-parameter-type="boolean"]' ).textContent ).toBe(
		'boolean'
	);
	expect( container.querySelector( '[data-parameter-type] input' ) ).toBeNull();
} );

it( 'dispatches query changes and clears a present value with the parameter name only', () => {
	const { setQueryParam } = renderWorkspace();

	changeInput( container.querySelector( '[aria-label="context"]' ), 'edit' );
	act( () => container.querySelector( '[aria-label="enabled"]' ).click() );
	changeInput( container.querySelector( '[aria-label="tags"]' ), 'three, four' );
	act( () => container.querySelector( '[aria-label="Clear count"]' ).click() );

	expect( setQueryParam ).toHaveBeenNthCalledWith( 1, 'context', 'edit' );
	expect( setQueryParam ).toHaveBeenNthCalledWith( 2, 'enabled', true );
	expect( setQueryParam ).toHaveBeenNthCalledWith( 3, 'tags', [ 'three', 'four' ] );
	expect( setQueryParam ).toHaveBeenNthCalledWith( 4, 'count' );
} );

it( 'dispatches body changes through the Body tab', () => {
	const { setBodyParam } = renderWorkspace();
	act( () =>
		Array.from( container.querySelectorAll( '[role="tab"]' ) )
			.find( ( tab ) => 'Body' === tab.textContent )
			.click()
	);

	changeInput( container.querySelector( '[aria-label="title"]' ), 'New title' );

	expect( setBodyParam ).toHaveBeenCalledWith( 'title', 'New title' );
} );

it( 'shows an endpoint state before selection', () => {
	renderWorkspace( { endpoint: false } );

	expect( container.querySelector( '[role="status"]' ).textContent ).toBe(
		'Select an endpoint to configure request parameters.'
	);
} );

it( 'shows explicit empty states for Query and Body tabs', () => {
	renderWorkspace( {
		endpoint: { request: { path: {}, query: {}, body: {} } },
		queryParams: {},
	} );

	expect( container.querySelector( '[role="status"]' ).textContent ).toBe(
		'This endpoint has no query parameters.'
	);

	act( () =>
		Array.from( container.querySelectorAll( '[role="tab"]' ) )
			.find( ( tab ) => 'Body' === tab.textContent )
			.click()
	);
	expect( container.querySelector( '[role="status"]' ).textContent ).toBe(
		'This endpoint has no body parameters.'
	);
} );
