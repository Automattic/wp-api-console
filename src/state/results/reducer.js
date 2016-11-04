import { createReducer } from '../../lib/redux/create-reducer';
import { REQUEST_RESULTS_RECEIVE } from '../actions';

const reducer = createReducer([], {
  [REQUEST_RESULTS_RECEIVE]: (state, action) => {
    const { id, version, apiName, method, path, status, body, error, duration } = action.payload;
    return [
      { id, request: { version, apiName, method, path, duration }, response: { status, body, error } },
      ...state
    ];
  }
});

export default reducer;
