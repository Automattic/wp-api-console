// serializeMiddleware.js
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
	// Convert urlParams to a plain object
	let paramsObject = {};
	for (let [key, value] of urlParams.entries()) {
		paramsObject[key] = value;
	}

	// Let each reducer handle its own state
	const deserializedState = reducers( paramsObject, { type: 'DESERIALIZE_URL' } );
	console.log('deserializing', deserializedState);
	return deserializedState;
};

// On these actions, we compute the new URL and push it to the browser history
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
