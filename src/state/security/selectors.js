export const isReady = (state, apiName) =>
  state.security[apiName] ? state.security[apiName].ready : false;

export const isLoggedin = (state, apiName) =>
  state.security[apiName] ? state.security[apiName].isLoggedin : false;

export const getUser = (state, apiName) =>
  state.security[apiName] ? state.security[apiName].user : false;
