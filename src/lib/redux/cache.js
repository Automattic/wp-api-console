import { SERIALIZE, DESERIALIZE } from './action-types';
import { urlParamsToStateObj } from './serialize-to-url-middleware';
import { deepMerge } from '../utils';

const DAY_IN_HOURS = 24;
const HOUR_IN_MS = 3600000;
const SERIALIZE_THROTTLE = 500;
const MAX_AGE = 30 * DAY_IN_HOURS * HOUR_IN_MS;
const STORAGE_KEY = 'REDUX_STATE';

export function serialize( state, reducer ) {
	const serializedState = reducer( state, { type: SERIALIZE } );
	return Object.assign( {}, serializedState, {
		_timestamp: Date.now(),
	} );
}

function deserialize( state, reducer ) {
	delete state._timestamp;
	return reducer( state, { type: DESERIALIZE } );
}

export function loadInitialState( initialState, reducer ) {
	let state = initialState;

	// Look for serialized state in localStorage
	const localStorageState = JSON.parse( localStorage.getItem( STORAGE_KEY ) ) || {};
	if ( localStorageState._timestamp && localStorageState._timestamp + MAX_AGE >= Date.now() ) {
		state = deserialize( localStorageState, reducer );
	}

	// Use deepMerge here to reconcile state derived from localStorage with
	// enhancements from URL parameters. It ensures a comprehensive application
	// state at launch by merging saved states and any state that's encoded in
	// the URL. This is important when the URL provides partial state updates,
	// which must be combined with existing state without loss of detail.
	let urlParams = new URL( window.location.href ).searchParams;
	let stateEnhancement = urlParamsToStateObj( urlParams );
	if ( stateEnhancement ) {
		state = deepMerge( state, stateEnhancement );
	}

	return state;
}

export function persistState( store, reducer ) {
	let state;
	let needsStoring = false;

	store.subscribe( () => {
		const nextState = store.getState();
		needsStoring = nextState !== state;
		state = nextState;
	} );

	setInterval( () => {
		if ( needsStoring ) {
			localStorage.setItem( STORAGE_KEY, JSON.stringify( serialize( state, reducer ) ) );
		}

		needsStoring = false;
	}, SERIALIZE_THROTTLE );
}
