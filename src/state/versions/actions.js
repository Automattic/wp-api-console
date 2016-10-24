import { API_VERSIONS_RECEIVE } from '../actions';
import { get } from '../../api';
import { selectVersion } from '../ui/actions';

const receiveVersions = (apiName, versions) => {
  return {
    type: API_VERSIONS_RECEIVE,
    payload: {
      apiName,
      versions
    }
  };
}

export const loadVersions = apiName => dispatch => {
  const api = get(apiName);
  api.loadVersions()
    .then(({ versions, current }) => {
      dispatch(selectVersion(current ? current : versions[0]));
      dispatch(receiveVersions(apiName, versions));
    });
}
