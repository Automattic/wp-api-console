import superagent from 'superagent';

const baseUrl = 'https://public-api.wordpress.com/rest/'
const api = {
  name: '.COM API',
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
  baseUrl
}

export default api;
