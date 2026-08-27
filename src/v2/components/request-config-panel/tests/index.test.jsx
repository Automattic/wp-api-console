import fs from 'node:fs';
import path from 'node:path';

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

it( 'uses the same compact heading and content height as the parameter panel', () => {
	const css = fs.readFileSync(
		path.resolve( 'src/v2/components/request-config-panel/style.css' ),
		'utf8'
	);

	expect( css ).toMatch(
		/\.v2-request-config-panel \.components-card__header\s*\{[^}]*min-height:\s*36px;[^}]*padding:\s*6px 12px;/s
	);
	expect( css ).toMatch(
		/\.v2-request-config-panel \.components-card__header h2\s*\{[^}]*font-size:\s*13px;/s
	);
	expect( css ).toMatch(
		/\.v2-request-config-panel \.v2-request-config-panel__body\s*\{[^}]*padding:\s*0;/s
	);
	expect( css ).toMatch(
		/\.v2-request-config-panel \.request-config-editor__code\s*\{[^}]*min-height:\s*222px;/s
	);
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
