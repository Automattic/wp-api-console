import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { vi } from 'vitest';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock( '@wordpress/components', () => ( {
	Card: ( { children, ...props } ) => (
		<section data-wordpress-component="Card" { ...props }>
			{ children }
		</section>
	),
	CardBody: ( { children, ...props } ) => (
		<div data-wordpress-component="CardBody" { ...props }>
			{ children }
		</div>
	),
	CardHeader: ( { children, ...props } ) => (
		<header data-wordpress-component="CardHeader" { ...props }>
			{ children }
		</header>
	),
} ) );

vi.mock( '../../../../components/request-config-editor', () => ( {
	default: () => <div data-testid="existing-request-config-editor" />,
} ) );

import RequestConfigPanel from '../index';

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

it( 'renders the existing request configuration editor once inside a WordPress card', () => {
	act( () => root.render( <RequestConfigPanel /> ) );

	const card = container.querySelector( '[data-wordpress-component="Card"]' );
	const header = card.querySelector( '[data-wordpress-component="CardHeader"]' );
	const body = card.querySelector( '[data-wordpress-component="CardBody"]' );

	expect( header.querySelector( 'h2' ).textContent ).toBe( 'Request configuration JSON' );
	expect( body.querySelectorAll( '[data-testid="existing-request-config-editor"]' ) ).toHaveLength(
		1
	);
	expect( card.querySelectorAll( '[data-testid="existing-request-config-editor"]' ) ).toHaveLength(
		1
	);
} );
