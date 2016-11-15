import values from 'lodash/values';

export const getResults = state =>
	values( state.results ).sort( ( a, b ) => b.id - a.id );
