import superagent from 'superagent';

import { REQUEST_RESULTS_RECEIVE } from '../actions';
import { getMethod, getCompleteQueryUrl, getBodyParams } from '../request/selectors';
import { getToken } from '../security/selectors';
import { getSelectedApi, getSelectedVersion } from '../ui/selectors';
import { get } from '../../api';

const receiveResults = (id, version, apiName, method, path, status, body, error, duration) => {
  return {
    type: REQUEST_RESULTS_RECEIVE,
    payload: { id, version, apiName, method, path, status, body, error, duration }
  };
};

export const request = () => (dispatch, getState) => {
  const state = getState();
  const apiName = getSelectedApi(state);
  const version = getSelectedVersion(state);
  const method = getMethod(state);
  const path = getCompleteQueryUrl(state);
  const api = get(apiName);
  const body = getBodyParams(state);
  const token = getToken(state);
  const start = new Date().getTime();

  const request = superagent(method, `${api.baseUrl}${version}${path}`)
    .send(body)
    .set('accept', 'application/json');

  if (token) {
    request.set('Authorization', `BEARER ${token}`);
  }

  return request
    .end((err, res) => {
      console.log(res);
      const end = new Date().getTime();
      dispatch(receiveResults(start, version, apiName, method, path, res.status, res.body, res.error, end - start));
    });
}
