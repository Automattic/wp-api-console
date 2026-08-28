import { act } from 'react';
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
	default: ( props ) => <div data-empty-message={ props.emptyMessage } data-testid="v1-results" />,
} ) );
vi.mock( '../components/parameter-workspace', () => ( {
	default: () => <div data-testid="parameter-workspace" />,
} ) );
vi.mock( '../components/request-config-panel', () => ( {
	default: () => <div data-testid="request-config-panel" />,
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

it( 'shows one dashed general empty state when no endpoint is selected', () => {
	act( () => root.render( <V2Layout endpoint={ null } /> ) );

	const app = container.querySelector( '.v2-console' );
	const main = app.querySelector( 'main.v2-console__main' );
	const emptyState = main.querySelector( '.v2-endpoint-empty-state' );

	expect(
		Array.from( app.children ).map( ( node ) => node.dataset.testid || node.className )
	).toEqual( [ 'v1-header', 'v2-console__main' ] );
	expect( emptyState.tagName ).toBe( 'SECTION' );
	expect( emptyState.getAttribute( 'role' ) ).toBe( 'status' );
	expect( emptyState.querySelector( 'h2' ).textContent ).toBe( 'Select an endpoint' );
	expect( emptyState.textContent ).toContain(
		'Choose an endpoint to configure request parameters, generate JSON, and view request responses.'
	);
	expect( emptyState.querySelector( '[data-wordpress-component="CardHeader"]' ) ).toBeNull();
	expect( main.querySelector( '.v2-console__workspace' ) ).toBeNull();
	expect( main.querySelector( '.v2-results-card' ) ).toBeNull();
	expect( container.querySelectorAll( '[data-testid="v1-results"]' ) ).toHaveLength( 0 );
} );

it( 'reuses the V1 header and wraps V2 results in a request history card after endpoint selection', () => {
	act( () => root.render( <V2Layout endpoint={ {} } /> ) );

	const app = container.querySelector( '.v2-console' );
	const main = app.querySelector( 'main.v2-console__main' );
	const workspace = main.querySelector( 'section.v2-console__workspace' );

	expect(
		Array.from( app.children ).map( ( node ) => node.dataset.testid || node.className )
	).toEqual( [ 'v1-header', 'v2-console__main' ] );
	expect(
		Array.from( main.children ).map( ( node ) => node.dataset.testid || node.className )
	).toEqual( [ 'v2-console__workspace', 'v2-results-card' ] );
	expect( workspace.getAttribute( 'aria-label' ) ).toBe( 'Request workspace' );
	expect( Array.from( workspace.children ).map( ( node ) => node.dataset.testid ) ).toEqual( [
		'parameter-workspace',
		'request-config-panel',
	] );
	expect( container.querySelectorAll( '[data-testid="v1-header"]' ) ).toHaveLength( 1 );
	const resultsCard = main.querySelector( '.v2-results-card' );
	const results = resultsCard.querySelector( '[data-testid="v1-results"]' );

	expect( resultsCard.querySelector( 'h2' ).textContent ).toBe( 'Request history' );
	expect( results.dataset.emptyMessage ).toBe( 'Responses from sent requests will appear here.' );
	expect( container.querySelectorAll( '[data-testid="v1-results"]' ) ).toHaveLength( 1 );
} );
