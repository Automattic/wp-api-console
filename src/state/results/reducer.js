import { REQUEST_RESULTS_RECEIVE } from '../actions';

const reducer = (state = [], action) => {
  switch (action.type) {
    case REQUEST_RESULTS_RECEIVE:
      const { id, version, apiName, method, path, status, body, error, duration } = action.payload;
      return [
        { id, request: { version, apiName, method, path, duration }, response: { status, body, error } },
        ...state
      ];
    default:
      return state;
  }
};

export default reducer;
