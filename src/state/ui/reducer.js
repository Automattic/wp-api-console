import { createReducer } from '../../lib/redux/create-reducer';
import { UI_SELECT_API, UI_SELECT_VERSION } from '../actions';
import { getDefault } from '../../api';
import schema from './schema';

const reducer = createReducer( { api: getDefault().name, version: null }, {
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
