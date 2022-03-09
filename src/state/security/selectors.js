export const isReady = ( state, apiName ) => {
	const security = state.security[ apiName ];

	if ( ! security ) {
		return false;
	}

	return security.ready || false;
};

export const isLoggedin = ( state, apiName ) => {
	const security = state.security[ apiName ];

	if ( ! security ) {
		return false;
	}

	return security.isLoggedin || false;
};

export const getUser = ( state, apiName ) => {
	const security = state.security[ apiName ];

	if ( ! security ) {
		return false;
	}

	return security.user || false;
};
