import { SET_LEFT_DIFF, SET_RIGHT_DIFF } from '../actions';

export const setLeftDiff = ( json, id ) => {
	return {
		type: SET_LEFT_DIFF,
		payload: {
			json,
			id,
		},
	};
};

export const setRightDiff = ( json, id ) => {
	return {
		type: SET_RIGHT_DIFF,
		payload: {
			json,
			id,
		},
	};
};
