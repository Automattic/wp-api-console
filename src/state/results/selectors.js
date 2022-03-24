export const getResults = state => {
	const results = state.results;

	if ( ! results ) {
		return [];
	}

	return Object.keys( results )
		.map( key => results[ key ] )
		.sort( ( a, b ) => b.id - a.id );
};
