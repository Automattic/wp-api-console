import fs from 'node:fs';
import path from 'node:path';

import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { vi } from 'vitest';

vi.mock( '@wordpress/components', () => ( {
	Button: ( { children, icon, label, size, variant, ...props } ) => (
		<button aria-label={ props[ 'aria-label' ] || label } data-icon={ icon || undefined } { ...props }>
			{ children }
		</button>
	),
	Card: ( { children, ...props } ) => <section { ...props }>{ children }</section>,
	CardBody: ( { children, ...props } ) => <div { ...props }>{ children }</div>,
	CardHeader: ( { children, ...props } ) => <header { ...props }>{ children }</header>,
	__experimentalNumberControl: ( { label, value, onChange } ) => (
		<input
			aria-label={ label.props?.children || label }
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
	Tooltip: ( { children, text } ) => <span data-tooltip-text={ text }>{ children }</span>,
	TextControl: ( { label, value, onChange } ) => (
		<input
			aria-label={ label.props?.children || label }
			data-control="text"
			value={ value }
			onChange={ ( event ) => onChange( event.target.value ) }
		/>
	),
	TextareaControl: ( { label, value, onChange } ) => (
		<textarea
			aria-label={ label.props?.children || label }
			data-control="json"
			value={ value }
			onChange={ ( event ) => onChange( event.target.value ) }
		/>
	),
	ToggleControl: ( { checked, label, onChange } ) => (
		<input
			aria-label={ label.props?.children || label }
			checked={ checked }
			data-control="boolean"
			type="checkbox"
			onChange={ ( event ) => onChange( event.target.checked ) }
		/>
	),
} ) );

import { getParameterWorkspaceProps, ParameterWorkspace } from '../index';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const endpoint = {
	request: {
		path: { $site: { type: 'string' } },
		query: {
			enabled: { type: 'boolean', description: 'Whether the feature is enabled.' },
			count: { type: 'integer' },
			ratio: { type: 'number' },
			tags: { type: 'array' },
			settings: { type: 'object' },
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
			tags: [ 'one', 2, false, { nested: true } ],
			settings: { answer: 42 },
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
		const prototype =
			input instanceof HTMLTextAreaElement
				? HTMLTextAreaElement.prototype
				: HTMLInputElement.prototype;
		Object.getOwnPropertyDescriptor( prototype, 'value' ).set.call( input, value );
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

it( 'exposes discovery descriptions through a keyboard-focusable tooltip control', () => {
	renderWorkspace();

	const helpButton = container.querySelector( '[aria-label="About enabled"]' );
	expect( helpButton.tagName ).toBe( 'BUTTON' );
	expect( helpButton.tabIndex ).toBe( 0 );
	expect( helpButton.dataset.icon ).toBe( 'info-outline' );
	expect( helpButton.closest( '[data-tooltip-text]' ).dataset.tooltipText ).toBe(
		'Whether the feature is enabled.'
	);
} );

it( 'normalizes legacy discovery types and object descriptions', () => {
	renderWorkspace( {
		endpoint: {
			request: {
				path: {},
				query: {
					enabled: { type: '(bool)' },
					count: { type: '(int)' },
					ratio: { type: '(float)' },
					context: {
						type: '(string)',
						description: {
							display: 'Use the display context.',
							edit: 'Use the edit context.',
						},
					},
				},
				body: {},
			},
		},
		queryParams: { enabled: false, count: 0, ratio: 1.5, context: 'display' },
	} );

	expect( container.querySelector( '[aria-label="enabled"]' ).dataset.control ).toBe( 'boolean' );
	expect( container.querySelector( '[aria-label="count"]' ).dataset.control ).toBe( 'number' );
	expect( container.querySelector( '[aria-label="ratio"]' ).dataset.control ).toBe( 'number' );
	expect( container.querySelector( '[aria-label="context"]' ).dataset.control ).toBe( 'text' );
	expect(
		Array.from( container.querySelectorAll( '[data-parameter-type]' ), ( badge ) => badge.textContent )
	).toEqual( [ 'boolean', 'integer', 'number', 'string' ] );
	expect(
		container.querySelector( '[aria-label="About context"]' ).closest( '[data-tooltip-text]' )
			.dataset.tooltipText
	).toBe( 'display: Use the display context.\nedit: Use the edit context.' );
} );

it( 'keeps the parameter list compact, scrolling internally under a sticky header', () => {
	const css = fs.readFileSync(
		path.resolve( 'src/v2/components/parameter-workspace/style.css' ),
		'utf8'
	);

	expect( css ).toMatch(
		/\.v2-parameter-workspace__table\s*\{[^}]*max-height:\s*222px;[^}]*overflow-y:\s*auto;/s
	);
	expect( css ).toMatch(
		/\.v2-parameter-workspace__table-header\s*\{[^}]*position:\s*sticky;[^}]*top:\s*0;/s
	);
	expect( css ).toMatch(
		/\.v2-parameter-workspace__table-header,[\s\S]*?\.v2-parameter-workspace__row\s*\{[^}]*gap:\s*8px;[^}]*padding:\s*4px 12px;/s
	);
	expect( css ).toMatch( /\.v2-parameter-workspace__row\s*\{[^}]*min-height:\s*36px;/s );
	expect( css ).toMatch(
		/\.v2-parameter-workspace \.v2-parameter-workspace__body\s*\{[^}]*padding:\s*0;/s
	);
	expect( css ).toMatch( /\.v2-parameter-workspace__table\s*\{[^}]*font-size:\s*13px;/s );
	expect( css ).toMatch(
		/\.v2-parameter-workspace__control input:not\( \[type="checkbox"\] \),[\s\S]*?\{[^}]*height:\s*32px;/s
	);
} );

it( 'renders static type badges and preserves false, zero, object, and mixed-array values', () => {
	renderWorkspace();

	const booleanControl = container.querySelector( '[data-control="boolean"]' );
	const integerControl = container.querySelector( '[aria-label="count"]' );
	const numberControl = container.querySelector( '[aria-label="ratio"]' );
	const arrayControl = container.querySelector( '[aria-label="tags"]' );
	const objectControl = container.querySelector( '[aria-label="settings"]' );

	expect( booleanControl.checked ).toBe( false );
	expect( integerControl.dataset.control ).toBe( 'number' );
	expect( integerControl.value ).toBe( '0' );
	expect( numberControl.dataset.control ).toBe( 'number' );
	expect( numberControl.value ).toBe( '1.5' );
	expect( arrayControl.dataset.control ).toBe( 'json' );
	expect( JSON.parse( arrayControl.value ) ).toEqual( [ 'one', 2, false, { nested: true } ] );
	expect( objectControl.dataset.control ).toBe( 'json' );
	expect( JSON.parse( objectControl.value ) ).toEqual( { answer: 42 } );
	expect( container.querySelector( '[data-parameter-type="boolean"]' ).textContent ).toBe(
		'boolean'
	);
	expect( container.querySelector( '[data-parameter-type] input' ) ).toBeNull();
} );

it( 'normalizes edited integer and number controls to numeric values', () => {
	const { setQueryParam } = renderWorkspace();

	changeInput( container.querySelector( '[aria-label="count"]' ), '7' );
	changeInput( container.querySelector( '[aria-label="ratio"]' ), '2.25' );

	expect( setQueryParam ).toHaveBeenNthCalledWith( 1, 'count', 7 );
	expect( setQueryParam ).toHaveBeenNthCalledWith( 2, 'ratio', 2.25 );
} );

it( 'dispatches query changes and clears a present value with the parameter name only', () => {
	const { setQueryParam } = renderWorkspace();

	changeInput( container.querySelector( '[aria-label="context"]' ), 'edit' );
	act( () => container.querySelector( '[aria-label="enabled"]' ).click() );
	changeInput( container.querySelector( '[aria-label="tags"]' ), '["three",4,false,{"ok":true}]' );
	changeInput( container.querySelector( '[aria-label="settings"]' ), '{"answer":84}' );
	act( () => container.querySelector( '[aria-label="Clear count"]' ).click() );

	expect( setQueryParam ).toHaveBeenNthCalledWith( 1, 'context', 'edit' );
	expect( setQueryParam ).toHaveBeenNthCalledWith( 2, 'enabled', true );
	expect( setQueryParam ).toHaveBeenNthCalledWith( 3, 'tags', [ 'three', 4, false, { ok: true } ] );
	expect( setQueryParam ).toHaveBeenNthCalledWith( 4, 'settings', { answer: 84 } );
	expect( setQueryParam ).toHaveBeenNthCalledWith( 5, 'count' );
} );

it( 'maps connected state without dropping real falsy values or inventing body presence', () => {
	const props = getParameterWorkspaceProps( {
		request: {
			endpoint,
			queryParams: { enabled: false, count: 0, search: '', tags: [], unset: undefined },
			bodyParams: { title: undefined, published: false },
		},
	} );

	expect( props.queryParams ).toEqual( { enabled: false, count: 0, search: '', tags: [] } );
	expect( props.bodyParams ).toEqual( { published: false } );
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
