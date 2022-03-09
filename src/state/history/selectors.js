export const getRecentEndpoints = ( state, apiName, version ) => {
	const history = state.history[ apiName ];

	if ( ! history ) {
		return [];
	}

	return history[ version ] || [];
};
