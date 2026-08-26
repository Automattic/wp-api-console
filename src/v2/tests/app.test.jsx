import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { vi } from 'vitest';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock( '../../state', () => ( {
	default: {
		getState: () => ( {} ),
		subscribe: () => () => {},
		dispatch: vi.fn(),
	},
} ) );
vi.mock( '../../components/header', () => ( {
	default: () => <div data-testid="v1-header" />,
} ) );
vi.mock( '../../components/results', () => ( {
	default: () => <div data-testid="v1-results" />,
} ) );

import { V2Layout } from '../app';

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
} );

it( 'reuses the V1 header and results around the V2 workspace', () => {
	act( () => root.render( <V2Layout /> ) );

	const app = container.querySelector( '.v2-console' );
	const main = app.querySelector( 'main.v2-console__main' );
	const workspace = main.querySelector( 'section.v2-console__workspace' );

	expect(
		Array.from( app.children ).map( ( node ) => node.dataset.testid || node.className )
	).toEqual( [ 'v1-header', 'v2-console__main' ] );
	expect(
		Array.from( main.children ).map( ( node ) => node.dataset.testid || node.className )
	).toEqual( [ 'v2-console__workspace', 'v1-results' ] );
	expect( workspace.children ).toHaveLength( 2 );
	expect( container.querySelectorAll( '[data-testid="v1-header"]' ) ).toHaveLength( 1 );
	expect( container.querySelectorAll( '[data-testid="v1-results"]' ) ).toHaveLength( 1 );
} );
