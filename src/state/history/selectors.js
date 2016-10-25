export const getRecentEndpoints = (state, apiName, version) => {
  return state.history[apiName] && state.history[apiName][version]
    ? state.history[apiName][version]
    : [];
};
