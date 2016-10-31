import { guessEndpointDocumentation, parseEndpoints } from '../core';

it('Parse Core Endpoints', () => {
  const discoveryData = {
    namespace: 'wp/v2',
    routes: {
      '/wp/v2/sites/(?P<wpcom_site>[\w.:]+)/categories': {
        namespace: 'wp/v2',
        methods: ['GET','POST'],
        endpoints:[
          {
            methods: ['GET'],
            args:{
              context:{
                required: false,
                'default': 'view',
                enum: ['view','embed','edit'],
                description: 'Scope under which the request is made; determines fields present in response.'
              }
            }
          }
        ]
      }
    }
  };

  expect(parseEndpoints(discoveryData)).toEqual(
    [
      {
        path_format: '/sites/%s/categories',
        path_labeled: '/sites/$wpcom_site/categories',
        request: {
          body: [],
          query: {
            context: {
              description: 'Scope under which the request is made; determines fields present in response.'
            }
          },
          path:{
            $wpcom_site: {
              description: '',
              type: 'w.:'
            }
          }
        },
        description: 'List categories',
        group: 'categories',
        method: 'GET'
      }
    ]
  );
});

describe('Guess Description', () => {
  it('should guess categories endpoints descriptions', () => {
    expect(guessEndpointDocumentation('GET', 'wp/v2', '/sites/$wpcom_site/categories'))
      .toEqual({ group: 'categories', description: 'List categories' });

    expect(guessEndpointDocumentation('POST', 'wp/v2', '/sites/$wpcom_site/categories'))
      .toEqual({ group: 'categories', description: 'Create a category' });
  });

  it('should guess posts endpoints descriptions', () => {
    expect(guessEndpointDocumentation('GET', 'wp/v2', '/sites/$wpcom_site/posts'))
      .toEqual({ group: 'posts', description: 'List posts' });

    expect(guessEndpointDocumentation('POST', 'wp/v2', '/sites/$wpcom_site/posts'))
      .toEqual({ group: 'posts', description: 'Create a post' });

    expect(guessEndpointDocumentation('PUT', 'wp/v2', '/sites/$wpcom_site/posts/$id'))
      .toEqual({ group: 'posts', description: 'Edit a post' });

    expect(guessEndpointDocumentation('PATCH', 'wp/v2', '/sites/$wpcom_site/posts/$id'))
      .toEqual({ group: 'posts', description: 'Edit a post' });

    expect(guessEndpointDocumentation('DELETE', 'wp/v2', '/sites/$wpcom_site/posts/$id'))
      .toEqual({ group: 'posts', description: 'Delete a post' });
  });
});
