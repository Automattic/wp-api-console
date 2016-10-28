import { 
  getSelectedEndpoint,
  getUrl,
  getPathValues,
  getMethod,
  getQueryParams,
  getBodyParams,
  getEndpointPathParts,
  getCompleteQueryUrl,
  getRequestMethod
} from '../selectors';

it('getSelectedEndpoint should return the selected endpoint', () => {
  const endpoint = { path_labeled: 'myEndpoint' };
  const state = {
    request: { endpoint }
  };

  expect(getSelectedEndpoint(state)).toEqual(endpoint);
});

it('getUrl should return the defined url', () => {
  const url = '/url';
  const state = {
    request: { url }
  };

  expect(getUrl(state)).toEqual(url);
});

it('getPathValues should return the defined pathValues', () => {
  const pathValues = { '$site': 'mysite' };
  const state = {
    request: { pathValues }
  };

  expect(getPathValues(state)).toEqual(pathValues);
});

it('getMethod should return the selected method', () => {
  const method = 'GET';
  const state = {
    request: { method }
  };

  expect(getMethod(state)).toEqual(method);
});

it('getQueryParams should return the defined queryParams', () => {
  const queryParams = { 'context': 'view' };
  const state = {
    request: { queryParams }
  };

  expect(getQueryParams(state)).toEqual(queryParams);
});

it('getBodyParams should return the defined bodyParams', () => {
  const bodyParams = { 'context': 'view' };
  const state = {
    request: { bodyParams }
  };

  expect(getBodyParams(state)).toEqual(bodyParams);
});

it('getEndpointPathParts should explode the endpoint path correctly', () => {
  const endpoint = { path_labeled: '/site/$site/posts/slug:$slug' };
  const state = {
    request: { endpoint }
  };

  expect(getEndpointPathParts(state))
    .toEqual(["/site/","$site","/posts/slug:","$slug"]);
});

describe('getCompleteQueryUrl', () => {
  it('should use the url if not endpoint is selected', () => {
    const state = {
      request: { url: '/help?a=b' }
    };

    expect(getCompleteQueryUrl(state)).toEqual('/help?a=b');
  });

  it('should use the endpoint path, pathParts and queryParams if an endpoint is selected', () => {
    const state = {
      request: {
        endpoint: { path_labeled: '/site/$site/posts/slug:$slug' },
        pathValues: {
          $site: 'testsite.wordpress.com',
          $slug: '10'
        },
        queryParams: {
          'context': 'view',
          'page': ''
        }
      }
    };

    expect(getCompleteQueryUrl(state)).toEqual('/site/testsite.wordpress.com/posts/slug:10?context=view');
  });
});

describe('getRequestMethod', () => {
  it('should use the method if not endpoint is selected', () => {
    const state = {
      request: { method: 'DELETE' }
    };

    expect(getRequestMethod(state)).toEqual('DELETE');
  });

  it('should use the endpoint method if there is a selected endpoint', () => {
    const state = {
      request: {
        endpoint: { method: 'POST' },
        method: 'GET'
      }
    };

    expect(getRequestMethod(state)).toEqual('POST');
  });
});
