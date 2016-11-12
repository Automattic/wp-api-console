import { createReducer } from '../../lib/redux/create-reducer';
import { REQUEST_RESULTS_RECEIVE, REQUEST_TRIGGER } from '../actions';

const reducer = createReducer( {}, {
	[ REQUEST_TRIGGER ]: ( state, { payload: { id, version, apiName, method, path } } ) => {
		return ( {
			...state,
			[ id ]: { id, loading: true, request: { version, apiName, method, path } },
		} );
	},
	[ REQUEST_RESULTS_RECEIVE ]: ( state, { payload: { id, status, body, error, duration } } ) => {
		return {
			...state,
			[ id ]: {
				...state[ id ],
				loading: false,
				response: { status, body, error },
				duration,
			},
		};
	},
} );

export default reducer;
