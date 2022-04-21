import { SET_LEFT_DIFF } from '../actions';

export const setLeftDiff = json => {
	return {
		type: SET_LEFT_DIFF,
		payload: {
			json,
		},
	};
};
