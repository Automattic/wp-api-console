import reducers from '../../state/reducer';
import {
	API_ENDPOINTS_RECEIVE,
	REQUEST_SELECT_ENDPOINT,
	REQUEST_SET_METHOD,
	REQUEST_TRIGGER,
	UI_SELECT_API,
	UI_SELECT_VERSION,
	SERIALIZE_URL,
	DESERIALIZE_URL,
} from '../../state/actions';
import { getEndpoints } from '../../state/endpoints/selectors';
import { loadEndpoints } from '../../state/endpoints/actions';

/**
 * This lets us serialize the state to the URL.
 *
 * Note: Serialization is only ran on a few actions listed below (actionsThatUpdateUrl).
 *
 * The entire state is not serialized. Reducers are responsible for implementing
 * SERIALIZE_URL and DESERIALIZE_URL actions to handle their own state if they want to
 * serialize it into the URL.  They don't have to serialize all keys, or serialize at all.
 * If they choose to only serialize some keys, the results will be deep merged over the
 * the current state stored in localStorage by cache.js.
 *
 **/

// Given a state, return a string that can be used as a URL query string.
export const serializeStateToURLString = ( state ) => {
	const serializedState = reducers( state, { type: SERIALIZE_URL } );

	const urlParams = new URLSearchParams();
	for ( const [ key, value ] of Object.entries( serializedState ) ) {
		if ( typeof value === 'string' && value ) {
			urlParams.set( key, value );
		}
	}
	return urlParams.toString();
};

// Given URL Params, return a state enhancement object that can be used to enhance the state.
export const urlParamsToStateObj = ( urlParams ) => {
	// Convert urlParams to a plain object
	let paramsObject = {};
	for ( let [ key, value ] of urlParams.entries() ) {
		paramsObject[ key ] = value;
	}

	// Let each reducer handle its own state
	const deserializedState = reducers( paramsObject, { type: DESERIALIZE_URL } );
	return deserializedState;
};

// On these actions, we compute the new URL and push it to the browser history
const actionsThatUpdateUrl = [
	REQUEST_TRIGGER,
	UI_SELECT_API,
	UI_SELECT_VERSION,
	REQUEST_SET_METHOD,
	REQUEST_SELECT_ENDPOINT,
];

// On our initial load, we check the URL params to see if we need to send a request to load endpoints.
const initializeFromUrl = ( store, urlParams ) => {
	const stateEnhancement = urlParamsToStateObj( urlParams );
	const {
		ui: { api: apiFromUrl, version: versionFromUrl },
		request: { endpointPathLabeledInURL },
	} = stateEnhancement;
	if ( endpointPathLabeledInURL && apiFromUrl && versionFromUrl ) {
		// They did send an endpointPath in the URL. In order to fill the entire 
		// endpoint state, we need to load all endpoints, then we can find a match after load.
		const { dispatch } = store;
		loadEndpoints( apiFromUrl, versionFromUrl )( dispatch );
		return { isInitializing: true, endpointPathLabeledInURL };
	}
	return { isInitializing: false };
};

// This middleware is responsible for serializing the state to the URL.
// It also handles a special case of loading endpoints and setting the selected endpoint.
export const serializeMiddleware = ( store ) => {
	// When first loading, check the URL params to see if we need to send a request to load endpoints.
	const urlParams = new URL( window.location.href ).searchParams;
	let { isInitializing, endpointPathLabeledInURL } = initializeFromUrl( store, urlParams );

	// The actual middleware that runs on every action.
	return ( next ) => ( action ) => {
		const result = next( action );

		// Serialize and upate the URL.
		if ( actionsThatUpdateUrl.includes( action.type ) ) {
			const state = store.getState();
			const serializedState = serializeStateToURLString( state );

			const url = new URL( window.location );
			url.search = serializedState;
			window.history.pushState( {}, '', url );
		}

		// Choose the correct endpoint once per load.
		if ( isInitializing && action.type === API_ENDPOINTS_RECEIVE ) {
			selectCorrectEndpoint( store, endpointPathLabeledInURL );
			isInitializing = false;
		}

		return result;
	};
};

const selectCorrectEndpoint = ( store, endpointPathLabeledInURL ) => {
	const state = store.getState();
	const endpoints = getEndpoints( state, state.ui.api, state.ui.version );
	const endpoint = endpoints.find(
		( { pathLabeled } ) => pathLabeled === endpointPathLabeledInURL
	);
	if ( endpoint ) {
		store.dispatch( { type: REQUEST_SELECT_ENDPOINT, payload: { endpoint } } );
	}
};


export default serializeMiddleware;
