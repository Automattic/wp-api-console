import { REQUEST_RESULTS_RECEIVE } from '../actions';
import { getRequestMethod, getCompleteQueryUrl, getBodyParams } from '../request/selectors';
import { getSelectedApi, getSelectedVersion } from '../ui/selectors';
import { get } from '../../api';

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
  const method = getRequestMethod(state);
  const path = getCompleteQueryUrl(state);
  const api = get(apiName);
  const body = getBodyParams(state);
  const start = new Date().getTime();
  const request = api.buildRequest(version, method, path, body);

  return api.authProvider.request(request)
    .then(({ status, body, error }) => {
      const end = new Date().getTime();
      dispatch(receiveResults(start, version, apiName, method, path, status, body, error, end - start));
    });
}
