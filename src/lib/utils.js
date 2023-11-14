import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
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

// Use this to make the URL shorter
const keyMap = {
	method: 'me',
	endpoint: 'ep',
	pathValues: 'pv',
	url: 'u',
	queryParams: 'qp',
	bodyParams: 'bp',
	endpointPathLabeledInURL: 'epu',
	version: 've',
	api: 'ap',
};

// Filter and serialize part of the Redux state for URL encoding
export const serializeStateForUrl = ( state, keysToKeep ) => {
	const filteredState = keysToKeep.reduce( ( obj, key ) => {
		const shortKey = keyMap[ key ] || key;
		if ( state.hasOwnProperty( key ) ) {
			obj[ shortKey ] = state[ key ];
		}
		return obj;
	}, {} );

	const jsonString = JSON.stringify( filteredState );
	return compressToEncodedURIComponent( jsonString );
};

// Deserialize the encoded string back to state object
export const deserializeStateFromUrl = ( base64String, keysToKeep ) => {
	try {
		if ( typeof base64String !== 'string' ) {
			return {};
		}
		const jsonString = decompressFromEncodedURIComponent( base64String );
		const parsedState = JSON.parse( jsonString );

		// Validate the parsed state contains only the keys we're interested in
		return keysToKeep.reduce( ( obj, key ) => {
			const shortKey = keyMap[ key ] || key;
			if ( parsedState.hasOwnProperty( shortKey ) ) {
				obj[ key ] = parsedState[ shortKey ];
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
