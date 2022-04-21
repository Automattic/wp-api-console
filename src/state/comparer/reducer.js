import { createReducer } from '../../lib/redux/create-reducer';
import { SET_LEFT_DIFF, SET_RIGHT_DIFF } from '../actions';

const reducer = createReducer( {}, {
	[ SET_LEFT_DIFF ]: ( state, { payload: { json } } ) => {
		return {
			...state,
			leftSideDiff: json,
		};
	},
	[ SET_RIGHT_DIFF ]: ( state, { payload: { json } } ) => {
		return {
			...state,
			rightSideDiff: json,
		};
	},
} );

export default reducer;
