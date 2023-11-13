// serializeMiddleware.js
import { serializeStateForUrl, deserializeStateFromUrl } from '../lib/utils';

export const serializeFullState = ( state ) => {
	const serializedParts = {
		ui: serializeStateForUrl( state.ui, [ 'api', 'version' ] ),
		request: serializeStateForUrl( state.request, [
			'url',
			'queryParams',
			'pathValues',
			'method',
			'bodyParams',
		] ),
	};
	const urlParams = new URLSearchParams();
	for ( const [ key, value ] of Object.entries( serializedParts ) ) {
		if ( value ) {
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
