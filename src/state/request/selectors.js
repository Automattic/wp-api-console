function compact( array ) {
	let index = -1;
	const length = array === null ? 0 : array.length;
	let resIndex = 0;
	const result = [];

	while ( ++index < length ) {
		const value = array[ index ];
		if ( value ) {
			result[ resIndex++ ] = value;
		}
	}
	return result;
}

export const getSelectedEndpoint = state => state.request.endpoint;

export const getUrl = state => state.request.url;

export const getPathValues = state => {
	const endpoint = getSelectedEndpoint( state );
	if ( ! endpoint ) {
		return {};
	}
	const pathArgs = Object.keys( endpoint.request.path );

	return pathArgs.reduce( ( ret, arg ) => {
		return {
			...ret,
			[ arg ]: state.request.pathValues[ arg ],
		};
	}, {} );
};

export const getMethod = state => state.request.method;

export const getQueryParams = state => {
	const endpoint = getSelectedEndpoint( state );
	if ( ! endpoint ) {
		return {};
	}
	const queryArgs = Object.keys( endpoint.request.query || {} );

	return queryArgs.reduce( ( ret, arg ) => {
		if (
			! state.request.queryParams[ arg ] || (
				Array.isArray( state.request.queryParams[ arg ] ) &&
				! state.request.queryParams[ arg ].length
			)
		) {
			return ret;
		}
		return {
			...ret,
			[ arg ]: state.request.queryParams[ arg ],
		};
	}, {} );
};

export const getBodyParams = state => {
	const endpoint = getSelectedEndpoint( state );
	if ( ! endpoint ) {
		return {};
	}
	const bodyArgs = Object.keys( endpoint.request.body || {} );

	return bodyArgs.reduce( ( ret, arg ) => {
		return {
			...ret,
			[ arg ]: state.request.bodyParams[ arg ],
		};
	}, {} );
};

export const getEndpointPathParts = state => {
	const endpoint = getSelectedEndpoint( state );
	if ( ! endpoint ) {
		return [];
	}

	const params = Object.keys( endpoint.request.path );
	// We have to include the capture group around the full match so that
	// the parameter name appears in the list when splitting. By using
	// split here instead of match we get the named parameters as parts
	// and also everything in between them without having to specify in
	// the RegExp pattern "these names or _not_ these names".
	const pathRegex = new RegExp( `(${ params.map( name => `\\${ name }` ).join( '|' ) })`, 'g' );
	const pathParts = endpoint.pathLabeled.split( pathRegex );

	return compact( pathParts );
};

export const getCompleteQueryUrl = state => {
	const endpoint = getSelectedEndpoint( state );
	if ( ! endpoint ) {
		return getUrl( state );
	}
	const parts = getEndpointPathParts( state );
	const values = getPathValues( state );
	const queryParams = getQueryParams( state );
	const buildParamUrl = ( param, value ) => {
		if ( Array.isArray( value ) ) {
			return value.map( subvalue => `${ param }[]=${ encodeURIComponent( subvalue ) }` )
				.join( '&' );
		}

		return `${ param }=${ encodeURIComponent( value ) }`;
	};
	const queryString = Object.keys( queryParams ).length === 0
		? ''
		: '?' + Object.keys( queryParams )
				.map( param => buildParamUrl( param, queryParams[ param ] ) )
				.join( '&' );

	return parts.reduce( ( url, part ) =>
		url +
			( part[ 0 ] === '$' ? values[ part ] || '' : part )
	, '' ) + queryString;
};

export const getRequestMethod = state => {
	const endpoint = getSelectedEndpoint( state );

	return endpoint ? endpoint.method : getMethod( state );
};

export const filterEndpoints = ( state, endpoints ) => {
	const url = getUrl( state ).toLowerCase();

	return endpoints.filter( endpoint =>
		endpoint.pathLabeled.toLowerCase().indexOf( url ) !== -1 ||
		endpoint.description.toLowerCase().indexOf( url ) !== -1
	);
};
