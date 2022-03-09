export const getEndpoints = ( state, apiName, version ) => {
	const endpoints = state.endpoints[ apiName ];

	if ( ! endpoints ) {
		return [];
	}

	return endpoints[ version ] || [];
};
