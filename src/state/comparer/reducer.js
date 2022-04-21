import { createReducer } from '../../lib/redux/create-reducer';
import { SET_LEFT_DIFF, SET_RIGHT_DIFF, TOGGLE_DIFF } from '../actions';

const reducer = createReducer( {}, {
	[ SET_LEFT_DIFF ]: ( state, { payload: { json, id } } ) => {
		return {
			...state,
			leftSideDiff: json,
			leftSideId: id,
		};
	},
	[ SET_RIGHT_DIFF ]: ( state, { payload: { json, id } } ) => {
		return {
			...state,
			rightSideDiff: json,
			rightSideId: id,
		};
	},
	[ TOGGLE_DIFF ]: state => {
		return {
			...state,
			visible: ! state.visible,
		};
	},
} );

export default reducer;
