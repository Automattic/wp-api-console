import { createReducer } from '../../lib/redux/create-reducer';
import { REQUEST_SELECT_ENDPOINT } from '../actions';
import schema from './schema';
import find from 'lodash/find';

const MAX_HISTORY_ENDPOINTS = 10;

const reducer = createReducer({}, {
  [REQUEST_SELECT_ENDPOINT]: (state, { payload: { apiName, version, endpoint } }) => {
    if (! endpoint) {
      return state;
    }

    if ( state[apiName] &&
          state[apiName][version] &&
          find( state[apiName][version], { 'path_labeled': endpoint.path_labeled } ) ) {
      return state;
    }

    return {
      ...state,
      [apiName]: {
        ...state[apiName],
        [version]: [
          endpoint,
          ...(state[apiName] && state[apiName][version] ? state[apiName][version] : [])
        ].slice(0, MAX_HISTORY_ENDPOINTS)
      }
    };
  }
}, schema);

export default reducer;
