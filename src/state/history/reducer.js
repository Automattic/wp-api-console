import { createReducer } from '../../lib/redux/create-reducer';
import { REQUEST_SELECT_ENDPOINT } from '../actions';
import schema from './schema';

const MAX_HISTORY_ENDPOINTS = 10;

const reducer = createReducer( {}, {
	[ REQUEST_SELECT_ENDPOINT ]: ( state, { payload: { apiName, version, endpoint } } ) => {
		if ( ! endpoint ) {
			return state;
		}
		let currentEndpoints = [];

		if ( state[ apiName ] && state[ apiName ][ version ] ) {
			currentEndpoints = state[ apiName ][ version ].filter(
				existingEndpoint => existingEndpoint.pathLabeled !== endpoint.pathLabeled
			);
		}

		return {
			...state,
			[ apiName ]: {
				...state[ apiName ],
				[ version ]: [
					endpoint,
					...currentEndpoints,
				].slice( 0, MAX_HISTORY_ENDPOINTS ),
			},
		};
	},
}, schema );

export default reducer;
