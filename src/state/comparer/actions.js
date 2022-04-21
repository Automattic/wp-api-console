import { SET_LEFT_DIFF, SET_RIGHT_DIFF } from '../actions';

export const setLeftDiff = json => {
	return {
		type: SET_LEFT_DIFF,
		payload: {
			json,
		},
	};
};

export const setRightDiff = json => {
	return {
		type: SET_RIGHT_DIFF,
		payload: {
			json,
		},
	};
};
