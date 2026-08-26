import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { vi } from 'vitest';

import { ParameterWorkspace } from '../index';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

Object.defineProperty( window, 'matchMedia', {
	configurable: true,
	value: vi.fn( () => ( {
		addEventListener: vi.fn(),
		matches: false,
		removeEventListener: vi.fn(),
	} ) ),
} );

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
	vi.restoreAllMocks();
} );

it( 'uses real WordPress controls without forwarded-prop warnings and preserves JSON value types', () => {
	const error = vi.spyOn( console, 'error' ).mockImplementation( () => {} );
	const setQueryParam = vi.fn();

	act( () => {
		root.render(
			<ParameterWorkspace
				bodyParams={ {} }
				endpoint={ {
					request: {
						body: {},
						path: {},
						query: {
							enabled: { type: 'boolean' },
							settings: { type: 'object' },
							mixed: { type: 'array' },
						},
					},
				} }
				queryParams={ {
					enabled: false,
					settings: { answer: 42 },
					mixed: [ 'one', 2, false, { nested: true } ],
				} }
				setBodyParam={ vi.fn() }
				setQueryParam={ setQueryParam }
			/>
		);
	} );

	const checkbox = container.querySelector( 'input[type="checkbox"]' );
	const jsonControls = Array.from( container.querySelectorAll( 'textarea' ) );

	expect( checkbox.checked ).toBe( false );
	expect( JSON.parse( jsonControls[ 0 ].value ) ).toEqual( { answer: 42 } );
	expect( JSON.parse( jsonControls[ 1 ].value ) ).toEqual( [ 'one', 2, false, { nested: true } ] );
	expect( container.textContent ).not.toContain( 'Separate with commas or the Enter key.' );
	expect( error ).not.toHaveBeenCalled();
} );
