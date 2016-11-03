import { createReducer } from '../../lib/redux/create-reducer';
import {
  REQUEST_SET_METHOD,
  REQUEST_SELECT_ENDPOINT,
  REQUEST_UPDATE_URL,
  REQUEST_UPDATE_PATH_PART_VALUE,
  REQUEST_SET_QUERY_PARAM,
  REQUEST_SET_BODY_PARAM
} from '../actions';

const reducer = createReducer({ method: 'GET', endpoint: false, pathValues: {}, url: '', queryParams: {}, bodyParams: {} }, {
  [REQUEST_SET_METHOD]: (state, { payload }) => ({
    ...state,
    method: payload
  }),
  [REQUEST_SELECT_ENDPOINT]: (state, { payload: { endpoint } }) => ({
    ...state,
    endpoint: endpoint,
    url: ''
  }),
  [REQUEST_UPDATE_URL]: (state, { payload }) => ({
    ...state,
    url: payload
  }),
  [REQUEST_UPDATE_PATH_PART_VALUE]: (state, { payload: { pathPart, value } }) => ({
    ...state,
    pathValues: {
      ...state.pathValues,
      [pathPart]: value
    }
  }),
  [REQUEST_SET_BODY_PARAM]: (state, { payload: { param, value } }) => ({
    ...state,
    bodyParams: {
      ...state.bodyParams,
      [param]: value
    }
  }),
  [REQUEST_SET_QUERY_PARAM]: (state, { payload: { param, value } }) => ({
    ...state,
    queryParams: {
      ...state.queryParams,
      [param]: value
    }
  })
});

export default reducer;
