import { getResults } from '../selectors';

const results = {
	1: { status: 200 },
};

const state = {
	results,
};

it( 'should return the results', () => {
	expect( getResults( state ) ).toEqual( [ { status: 200 } ] );
} );
