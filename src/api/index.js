import config from '../config';
import createCoreApi from './core';
import createDotComApi from './com';
import createOauth2Provider from '../auth/oauth2';
import createOauth1Provider from '../auth/oauth1';
import * as proxy from '../auth/proxy';


let APIs = [];

// Loading WP.com APIs
if (config['wordpress.com']) {
  const oauth2Config = {
    id: 'WPCOM',
    baseUrl: `https://public-api.wordpress.com/oauth2`,
    userUrl: `https://public-api.wordpress.com/rest/v1.1/me`,
    redirectUrl: config['wordpress.com'].redirect_uri,
    clientId: config['wordpress.com'].client_id
  }
  const authProvider = config['wordpress.com'].auth === 'proxy'
    ? proxy
    : createOauth2Provider(oauth2Config.id, oauth2Config.baseUrl, oauth2Config.userUrl, oauth2Config.redirectUrl, oauth2Config.clientId);

  const dotComWPApi = {
    name: 'WP.COM WP Rest Api',
    baseUrl: 'https://public-api.wordpress.com/',
    namespaces: ['wp/v2', 'wpcom/v2']
  };

  APIs = APIs.concat([
    createDotComApi(authProvider),
    createCoreApi(authProvider, dotComWPApi.name, dotComWPApi.baseUrl, dotComWPApi.namespaces)
  ]);
}

// Loading WP.org APIs
if (config['wordpress.org']) {
  APIs = APIs.concat(
    config['wordpress.org'].map(({ name, url, callbackUrl, publicKey, secretKey }) => {
      const oauth1Provider = createOauth1Provider(name, url, callbackUrl, publicKey, secretKey);

      return createCoreApi(oauth1Provider, name, `${url}/wp-json/`);
    })
  );
}

export const apis = APIs.map(api => api.name);
export const getDefault = () => APIs[0];
export const get = name => {
  return APIs.find(api => api.name === name) || getDefault();
};
