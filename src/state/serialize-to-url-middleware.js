// serializeMiddleware.js
import { serializeStateForUrl, deserializeStateFromUrl } from '../lib/utils';
import reducers from '../state/reducer';

export const serializeFullState = ( state ) => {
	const serializedState = reducers( state, { type: 'SERIALIZE_URL' } );
	const urlParams = new URLSearchParams();
	for ( const [ key, value ] of Object.entries( serializedState ) ) {
		if ( typeof value === 'string' && value ) {
			urlParams.set( key, value );
		}
	}
	return urlParams.toString();
};

export const deserializeFullState = ( urlParams ) => {
	const fullState = {};
	const deserializers = {
		ui: ( x ) => deserializeStateFromUrl( x, [ 'api', 'version' ] ),
		request: ( x ) =>
			deserializeStateFromUrl( x, [ 'url', 'queryParams', 'pathValues', 'method', 'bodyParams' ] ),
	};
	for ( const [ key, deserializer ] of Object.entries( deserializers ) ) {
		const serializedValue = urlParams.get( key );
		if ( serializedValue !== null ) {
			fullState[ key ] = deserializer( serializedValue );
		}
	}
	return fullState;
};

/// ///

const actionsThatUpdateUrl = [ 'REQUEST_TRIGGER' ];

export const serializeMiddleware = ( store ) => ( next ) => ( action ) => {
	const result = next( action ); // Let the action pass through all middleware and reducers

	console.log( 'middleware check' );
	if ( actionsThatUpdateUrl.includes( action.type ) ) {
		console.log( 'middleware done' );
		const state = store.getState();

		const serializedState = serializeFullState( state );

		const url = new URL( window.location );
		url.search = serializedState;
		window.history.pushState( {}, '', url );
	}

	return result;
};

export default serializeMiddleware;
