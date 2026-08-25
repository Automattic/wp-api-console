import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { vi } from 'vitest';

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

beforeEach( () => {
	container = document.createElement( 'div' );
	document.body.appendChild( container );
} );

afterEach( () => {
	ReactDOM.unmountComponentAtNode( container );
	container.remove();
} );

it( 'places the request workspace between the header and results', () => {
	act( () => {
		ReactDOM.render( <App />, container );
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
