import { compact } from 'lodash';

export const getSelectedEndpoint = state => state.request.endpoint;

export const getUrl = state => state.request.url;

export const getPathValues = state => state.request.pathValues;

export const getMethod = state => state.request.method;

export const getQueryParams = state => state.request.queryParams;

export const getBodyParams = state => state.request.bodyParams;

export const getEndpointPathParts = state => {
  const endpoint = getSelectedEndpoint(state);
  if (! endpoint) {
    return [];
  }
  const pathRegex = /\$[^/]*|([^$]*)/g;
  const pathParts = endpoint.path_labeled.match(pathRegex);

  return compact(pathParts);
}

export const getCompleteQueryUrl = state => {
  const endpoint = getSelectedEndpoint(state);
  if (! endpoint) {
    return getUrl(state);
  }
  const parts = getEndpointPathParts(state);
  const values = getPathValues(state);
  const queryParams = getQueryParams(state);
  const queryString = Object.keys(queryParams).length === 0
    ? ''
    : '?' + Object.keys(queryParams)
        .filter(param => !! queryParams[param])
        .map(param => `${param}=${queryParams[param]}`)
        .join('&');

  return parts.reduce((url, part) => {
    return url +
      ( part[0] === '$' ? values[part] || '' : part )
  }, '') + queryString;
}

export const getRequestMethod = state => {
  const endpoint = getSelectedEndpoint(state);

  return endpoint ? endpoint.method : getMethod(state);
}
