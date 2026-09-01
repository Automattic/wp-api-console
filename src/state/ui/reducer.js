import { createReducer } from '../../lib/redux/create-reducer';
import { REQUEST_CONFIG_APPLY, UI_SELECT_API, UI_SELECT_VERSION } from '../actions';
import { getDefault } from '../../api';
import schema from './schema';

const reducer = createReducer( { api: getDefault().name, version: null }, {
	[ REQUEST_CONFIG_APPLY ]: ( state, { payload } ) => {
		return {
			api: payload.api,
			version: payload.version,
		};
	},
	[ UI_SELECT_API ]: ( state, { payload } ) => {
		return ( {
			version: null,
			api: payload,
		} );
	},
	[ UI_SELECT_VERSION ]: ( state, { payload } ) => {
		return ( {
			...state,
			version: payload,
		} );
	},
}, schema );

export default reducer;
