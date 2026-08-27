import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { vi } from 'vitest';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock( './state', () => ( {
	default: {
		getState: () => ( {} ),
		subscribe: () => () => {},
		dispatch: vi.fn(),
	},
} ) );
vi.mock( './components/header', () => ( {
	default: () => <div data-testid="header" />,
} ) );
vi.mock( './components/query-builder', () => ( {
	default: () => <div data-testid="query-builder" />,
} ) );
vi.mock( './components/request-config-editor', () => ( {
	default: () => <div data-testid="request-config-editor" />,
} ) );
vi.mock( './components/results', () => ( {
	default: () => <div data-testid="results" />,
} ) );

import App from './app';

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

it( 'renders the original V1 header, query builder, and results sequence', () => {
	act( () => {
		root.render( <App /> );
	} );

	expect(
		Array.from( container.querySelector( '.App' ).children ).map( ( child ) =>
			child.getAttribute( 'data-testid' )
		)
	).toEqual( [ 'header', 'query-builder', 'results' ] );
} );
