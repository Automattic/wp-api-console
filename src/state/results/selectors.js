export const getResults = state => {
	const results = state.results;

	if ( ! results ) {
		return [];
	}

	return Object.keys( results )
		.map( key => results[ key ] )
		.sort( ( a, b ) => b.id - a.id );
};

export const getResultById = ( state, id ) => {
	const results = getResults( state );
	return results.filter( result => result.id === id )[ 0 ];
};
