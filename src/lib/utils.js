const objectCtorString = Function.prototype.toString.call( Object );

export function isPlainObject( value ) {
	if (
		value === null ||
		value === undefined ||
		typeof value !== 'object' ||
		value.toString() !== '[object Object]'
	) {
		return false;
	}

	const proto = Object.getPrototypeOf( Object( value ) );
	if ( proto === null ) {
		return true;
	}

	const Ctor = Object.hasOwnProperty.call( proto, 'constructor' ) && proto.constructor;
	return (
		typeof Ctor === 'function' &&
		Ctor instanceof Ctor &&
		Function.prototype.toString.call( Ctor ) === objectCtorString
	);
}

// Filter and serialize part of the Redux state for URL encoding
export const serializeStateForUrl = ( state, keysToKeep ) => {
	const filteredState = keysToKeep.reduce( ( obj, key ) => {
		if ( state.hasOwnProperty( key ) ) {
			obj[ key ] = state[ key ];
		}
		return obj;
	}, {} );

	const jsonString = JSON.stringify( filteredState );
	const base64Encoded = btoa( jsonString );
	return base64Encoded;
};

// Deserialize the Base64 encoded string back to state object
export const deserializeStateFromUrl = ( base64String, keysToKeep ) => {
	try {
		const jsonString = atob( base64String );
		const parsedState = JSON.parse( jsonString );

		// Validate the parsed state contains only the keys we're interested in
		return keysToKeep.reduce( ( obj, key ) => {
			if ( parsedState.hasOwnProperty( key ) ) {
				obj[ key ] = parsedState[ key ];
			}
			return obj;
		}, {} );
	} catch ( error ) {
		console.error( 'Error deserializing state from URL:', error );
		return {};
	}
};

export const isObject = ( item ) => {
	return item && typeof item === 'object' && ! Array.isArray( item );
};

export const deepMerge = ( target, source ) => {
	let output = Object.assign( {}, target );
	if ( isObject( target ) && isObject( source ) ) {
		Object.keys( source ).forEach( ( key ) => {
			if ( isObject( source[ key ] ) ) {
				if ( ! ( key in target ) ) Object.assign( output, { [ key ]: source[ key ] } );
				else output[ key ] = deepMerge( target[ key ], source[ key ] );
			} else {
				Object.assign( output, { [ key ]: source[ key ] } );
			}
		} );
	}
	return output;
};
