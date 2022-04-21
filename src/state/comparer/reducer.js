import { createReducer } from '../../lib/redux/create-reducer';
import { SET_LEFT_DIFF } from '../actions';

const reducer = createReducer( {}, {
	[ SET_LEFT_DIFF ]: ( state, { payload: { json } } ) => {
		return {
			...state,
			leftSideDiff: json,
		};
	},
} );

export default reducer;
