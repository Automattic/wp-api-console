import superagent from 'superagent';
import qs from 'qs';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

const createOauth1Provider = ( name, baseUrl, callbackUrl, publicKey, secretKey ) => {
	const TOKEN_STORAGE_KEY = `${ name }__OAUTH1CCESSTOKEN`;
	const REQUEST_TOKEN_STORAGE_KEY = `${ name }__REQUESTOAUTH1CCESSTOKEN`;

	/* eslint-disable camelcase */
	const oauth = new OAuth( {
		consumer: {
			key: publicKey,
			secret: secretKey,
		},
		signature_method: 'HMAC-SHA1',
		hash_function( baseString, key ) {
			return crypto.createHmac( 'sha1', key )
				.update( baseString ).digest( 'base64' );
		},
	} );
	/* eslint-enable camelcase */

	// Request using oauth headers
	const oauthRequest = ( method, url, body = null, token = null ) => {
		const requestData = {
			url,
			method,
		};

		const req = superagent( method, url )
			.set( 'Accept', 'application/json' )
			.set( oauth.toHeader( oauth.authorize( requestData, token ) ) );

		if ( body && Object.keys( body ).length > 0 ) {
			req.send( body );
		}

		return req;
	};


	let accessToken = null;
	const init = () => {
		if ( localStorage.getItem( TOKEN_STORAGE_KEY ) ) {
			accessToken = JSON.parse( localStorage.getItem( TOKEN_STORAGE_KEY ) );
		} else if ( window.location.href.indexOf( '?' ) !== -1 && localStorage.getItem( REQUEST_TOKEN_STORAGE_KEY ) ) {
			const args = qs.parse( window.location.href.split( '?' )[ 1 ] );
			const token = {
				...( JSON.parse( localStorage.getItem( REQUEST_TOKEN_STORAGE_KEY ) ) ),
				key: args.oauth_token,
			};
			localStorage.removeItem( REQUEST_TOKEN_STORAGE_KEY );
			const accessTokenUrl = `${ baseUrl }/oauth1/access?oauth_verifier=${ args.oauth_verifier }`;
			oauthRequest( 'POST', accessTokenUrl, null, token )
				.then( ( { body } ) => {
					localStorage.setItem( TOKEN_STORAGE_KEY, JSON.stringify( {
						key: body.oauth_token,
						secret: body.oauth_token_secret,
					} ) );
					window.location = window.location.pathname;
				} );
		}
	};

	const boot = () => {
		if ( ! accessToken ) {
			return Promise.reject();
		}
		return oauthRequest( 'GET', `${ baseUrl }/wp-json/wp/v2/users/me?_envelope`, null, accessToken ).then( ( { body } ) => {
			const user = body.body;
			return {
				...user,
				avatarUrl: user.avatar_urls ? Object.values( user.avatar_urls )[ 0 ] : '',
			};
		}, () => {
			accessToken = null;
			localStorage.removeItem( TOKEN_STORAGE_KEY );
			return Promise.reject();
		} );
	};

	const login = () => {
		const requestUrl = `${ baseUrl }/oauth1/request?callback_url=${ callbackUrl }`;
		oauthRequest( 'POST', requestUrl )
			.then( ( { body } ) => {
				localStorage.setItem( REQUEST_TOKEN_STORAGE_KEY, JSON.stringify( {
					secret: body.oauth_token_secret,
				} ) );
				const redirectUrl = baseUrl + '/oauth1/authorize?' + qs.stringify( {
					oauth_token: body.oauth_token, // eslint-disable-line camelcase
					oauth_callback: callbackUrl, // eslint-disable-line camelcase
				} );
				window.location = redirectUrl;
			} );
	};

	const logout = () => {
		accessToken = null;
		localStorage.removeItem( TOKEN_STORAGE_KEY );
	};

	const request = ( { method, url, body } ) =>
		new Promise( resolve => {
			// OAuth1 fails for arrays without indices
			const [ path, queryString ] = url.split( '?' );
			const args = qs.parse( queryString );
			const normalizedQueryString = qs.stringify( args, { arrayFormat: 'indices', encode: false } );
			const normalizedUrl = path + (
				normalizedQueryString
					? '?' + normalizedQueryString
					: ''
			);

			let req;
			if ( accessToken ) {
				req = oauthRequest( method, normalizedUrl, body, accessToken );
			} else {
				req = superagent( method, normalizedUrl )
					.set( 'Accept', 'application/json' );

				if ( body && Object.keys( body ).length > 0 ) {
					req.send( body );
				}
			}

			req.end( ( err, response = {} ) => {
				resolve( {
					status: response.status,
					body: response.body,
					error: err,
				} );
			} );
		} );

	init();

	return {
		boot, login, logout, request,
	};
};

export default createOauth1Provider;
