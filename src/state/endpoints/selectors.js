export const getEndpoints = (state, apiName, version) =>
  state.endpoints[apiName] && state.endpoints[apiName][version] ? state.endpoints[apiName][version] : [];
