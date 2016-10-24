const namespaces = ['wp/v2', 'wpcom/v2'];

const parseEndpoints = data => {
  var endpoints = [];

  Object.keys(data.routes).forEach(url => {
    const route = data.routes[url];
    // Drop the /wp/v2
    const rawpath = url.substr(data.namespace.length + 1);
    route.endpoints.forEach(rawEndpoint => {
      rawEndpoint.methods.forEach(method => {
        // Parsing Query
        const query = {};
        Object.keys(rawEndpoint.methods).forEach(key => {
          const arg = rawEndpoint.methods[key];
          query[key] = {
            description: {
              view: arg.description
            }
          };
        });

        // Parsing path
        const path = {};
        const paramRegex = /\([^\(\)]*\)/g;
        const parameters = rawpath.match(paramRegex) || [];
        let pathLabel = rawpath;
        let pathFormat = rawpath;
        parameters.forEach(param => {
          const paramDetailsRegex = /[^<]*<([^>]*)>\[([^\]]*)\][^]*/;
          const explodedParameter = param.match(paramDetailsRegex);
          const paramName = '$' + explodedParameter[1];
          path[paramName] = {
            description: '',
            type: explodedParameter[2]
          };
          pathLabel = pathLabel.replace(param, paramName);
          pathFormat = pathFormat.replace(param, '%s');
        });

        const endpoint = {
           description: '',
           group: '',
           method: method,
           path_format: pathFormat,
           path_labeled: pathLabel,
           request: {
               body: [],
               query: query,
               path: path
           }
        };

        endpoints.push(endpoint);
      });
    });
  });

  return endpoints;
};

const baseUrl = 'https://public-api.wordpress.com/'
const api = {
  name: 'CORE API',
  getDiscoveryUrl: version => baseUrl + version,
  loadVersions: () => new Promise(resolve => resolve({ versions: namespaces })),
  baseUrl,
  parseEndpoints
}

export default api;
