import { act } from 'react';
import { createRoot } from 'react-dom/client';

import { Results } from '../index';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

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

it( 'explains the request history when empty-state copy is provided', () => {
	act( () =>
		root.render(
			<Results emptyMessage="Responses from sent requests will appear here." results={ [] } />
		)
	);

	expect( container.textContent ).toBe( 'Responses from sent requests will appear here.' );
} );

it( 'keeps an unconfigured empty results list blank', () => {
	act( () => root.render( <Results results={ [] } /> ) );

	expect( container.textContent ).toBe( '' );
} );
