import superagent from 'superagent';

import { API_ENDPOINTS_RECEIVE } from '../actions';
import { get } from '../../api';

const receiveEndpoints = (apiName, version, endpoints) => {
  return {
    type: API_ENDPOINTS_RECEIVE,
    payload: {
      apiName,
      version,
      endpoints
    }
  };
}

export const loadEndpoints = (apiName, version) => dispatch => {
  const api = get(apiName);
  const url = api.getDiscoveryUrl(version);
  superagent
    .get(url)
    .set('accept', 'application/json')
    .then(res => {
      const endpoints = api.parseEndpoints(res.body);
      dispatch(receiveEndpoints(apiName, version, endpoints));
    });
}
