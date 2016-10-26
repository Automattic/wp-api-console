import superagent from 'superagent';

const baseUrl = 'https://public-api.wordpress.com/rest/'
const api = {
  name: 'WP.COM API',
  getDiscoveryUrl: version => baseUrl + version + '/help',
  parseEndpoints: data => data,
  loadVersions: () => {
    return superagent.get(baseUrl + 'v1.1/versions?include_dev=true')
      .set('accept', 'application/json')
      .then(res => {
        return {
          versions: res.body.versions.map(version => `v${version}`),
          current: `v${res.body.current_version}`
        };
      })
  },
  buildRequest: (version, method, path, body) => {
    return {
      url: baseUrl + version + path,
      apiVersion: version.substr(1),
      method,
      path,
      body
    };
  },
  baseUrl
}

const createApi = authProvider => ({
  authProvider,
  ...api
});

export default createApi;
