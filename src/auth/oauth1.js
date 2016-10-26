import superagent from 'superagent';
import querystring from 'querystring';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

const createOauth1Provider = (name, baseUrl, callbackURL, publicKey, secretKey) => {
  const TOKEN_STORAGE_KEY = `${name}__OAUTH1CCESSTOKEN`;
  const REQUEST_TOKEN_STORAGE_KEY = `${name}__REQUESTOAUTH1CCESSTOKEN`;

  const oauth = new OAuth({
		consumer: {
        key: publicKey,
        secret: secretKey
    },
		signature_method: 'HMAC-SHA1',
    hash_function: (base_string, key) => {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
    }
	});

  // Request using oauth headers
  const oauthRequest = (method, url, body = null, token = null) => {
    const requestData = {
      url,
      method,
      data: body
    };

    const req = superagent(method, url)
      .set('Accept', 'application/json')
      .set(oauth.toHeader(oauth.authorize(requestData, token)))

    if (body && Object.keys(body).length > 0) {
      req.send(body);
    }

    return req;
  }


  let accessToken = null;
  const init = () => {
    if (localStorage.getItem(TOKEN_STORAGE_KEY)) {
      accessToken = JSON.parse(localStorage.getItem(TOKEN_STORAGE_KEY));
    } else if ( window.location.href.indexOf( '?' ) !== -1 && localStorage.getItem(REQUEST_TOKEN_STORAGE_KEY)) {
      const args = querystring.parse( window.location.href.split('?')[1] );
      const token = {
        ...(JSON.parse(localStorage.getItem(REQUEST_TOKEN_STORAGE_KEY))),
        key: args.oauth_token
      };
      localStorage.removeItem(REQUEST_TOKEN_STORAGE_KEY);
      const accessTokenUrl = `${baseUrl}/oauth1/access?oauth_verifier=${args.oauth_verifier}`;
      oauthRequest('POST', accessTokenUrl, null, token)
        .then(({ body }) => {
          localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({
    				key: body.oauth_token,
    				secret: body.oauth_token_secret,
    			}));
          window.location = window.location.pathname;
        });
		}
  }

  const boot = () => {
    if (! accessToken) {
      return Promise.reject();
    }
    return oauthRequest('GET', `${baseUrl}/wp-json/wp/v2/users/1`, null, accessToken).then(({ body }) => {
      return {
        ...body,
        avatar_URL: body.avatar_urls ? Object.values(body.avatar_urls)[0] : ''
      };
    });
  }

  const login = () => {
    const requestUrl = `${baseUrl}/oauth1/request?callback_url=${callbackURL}`;
    oauthRequest('POST', requestUrl)
      .then(({ body }) => {
        localStorage.setItem(REQUEST_TOKEN_STORAGE_KEY, JSON.stringify({
  				secret: body.oauth_token_secret,
  			}));
        const redirectURL = baseUrl + '/oauth1/authorize?' + querystring.stringify({
  				oauth_token: body.oauth_token,
  				oauth_callback: callbackURL,
  			});
        window.location = redirectURL;
      });
  }

  const logout = () => {
    accessToken = null;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  const request = ({ method, url, body }) => {
    return new Promise(resolve =>
      oauthRequest(method, url, body, accessToken).end((err, response = {}) => {
        let error = err;
        if (err && response.body && response.body.error) {
          error = response.body.error;
        } else if (err && response.error) {
          error = response.error.message;
        }

        resolve({
          status: response.status,
          body: response.body,
          error
        });
      })
    );
  }

  init();

  return {
    boot, login, logout, request
  };
}

export default createOauth1Provider;
