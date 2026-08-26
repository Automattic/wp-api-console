import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

import RequestBody from '../body';
import { TREE_VIEW } from '../results-view-selector';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

it( 'renders a response body with the upgraded JSON tree package', () => {
	const container = document.createElement( 'div' );
	const root = createRoot( container );

	act( () => {
		root.render( <RequestBody response={ { body: { message: 'hello' } } } view={ TREE_VIEW } /> );
	} );

	expect( container.textContent ).toContain( 'message' );
	expect( container.textContent ).toContain( 'hello' );

	act( () => root.unmount() );
} );
