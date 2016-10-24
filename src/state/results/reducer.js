import { REQUEST_RESULTS_RECEIVE } from '../actions';

const reducer = (state = [], action) => {
  switch (action.type) {
    case REQUEST_RESULTS_RECEIVE:
      const { version, apiName, method, path, status, results } = action.payload;
      return [
        { request: { version, apiName, method, path }, response: { status, results } },
        ...state
      ];
    default:
      return state;
  }
};

export default reducer;
