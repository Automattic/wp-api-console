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

it( 'places the request workspace between the header and results', () => {
	act( () => {
		root.render( <App /> );
	} );

	const app = container.querySelector( '.App' );
	const children = Array.from( app.children );
	const workspace = children[ 1 ];

	expect(
		children.map( ( child ) => child.getAttribute( 'data-testid' ) || child.className )
	).toEqual( [ 'header', 'request-workspace', 'results' ] );
	expect(
		Array.from( workspace.children ).map( ( child ) => child.getAttribute( 'data-testid' ) )
	).toEqual( [ 'query-builder', 'request-config-editor' ] );
} );
