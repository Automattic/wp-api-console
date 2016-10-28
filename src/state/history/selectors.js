import { get } from 'lodash';

export const getRecentEndpoints = (state, apiName, version) => {
  return get(state.history, [ apiName, version ], []);
};
