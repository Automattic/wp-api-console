import { get } from 'lodash';

export const getEndpoints = (state, apiName, version) => {
  return get(state.endpoints, [ apiName, version ], []);
};
