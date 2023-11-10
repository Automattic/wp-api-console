import createCoreApi from './core';
import createDotComApi from './com';
import createOauth2Provider from '../auth/oauth2';
import createOauth1Provider from '../auth/oauth1';
import createBasicAuthProvider from '../auth/basic';
import * as proxy from '../auth/proxy';
const config = JSON.parse( __APP_CONFIG__ );

let APIs = [];

// Loading WP.com APIs
const wpcomConfig = config[ 'wordpress.com' ];
if ( wpcomConfig ) {
	const oauth2Config = {
		id: 'WPCOM',
		baseUrl: 'https://public-api.wordpress.com/oauth2',
		userUrl: 'https://public-api.wordpress.com/rest/v1.1/me',
		redirectUrl: wpcomConfig.redirectUrl || wpcomConfig.redirect_uri,
		clientId: wpcomConfig.clientID || wpcomConfig.clientId || wpcomConfig.client_id,
		scope: 'global',
	};
	const authProvider = config[ 'wordpress.com' ].auth === 'proxy'
		? proxy
		: createOauth2Provider(
				oauth2Config.id,
				oauth2Config.baseUrl,
				oauth2Config.userUrl,
				oauth2Config.redirectUrl,
				oauth2Config.clientId,
				oauth2Config.scope
			);

	const hasOrgWebsites = !! config[ 'wordpress.org' ] && !! Object.keys( config[ 'wordpress.org' ] ).length;
	const dotComWPApi = {
		name: hasOrgWebsites ? 'WP.COM WP REST API' : 'WP REST API',
		baseUrl: 'https://public-api.wordpress.com/',
		namespaces: [ 'wp/v2', 'wpcom/v2', 'wpcom/v3', 'wpcom/v4' ],
	};

	APIs = APIs.concat( [
		createDotComApi( authProvider ),
		createCoreApi( authProvider, dotComWPApi.name, dotComWPApi.baseUrl, dotComWPApi.namespaces ),
	] );
}

// Loading WP.org APIs
if ( config[ 'wordpress.org' ] ) {
	APIs = APIs.concat(
		config[ 'wordpress.org' ].map( site => {
			let authProvider;
			const { name, authType } = site;
			const url = site.url.replace( /\/+$/, '' );
			if ( authType === 'basic' ) {
				authProvider = createBasicAuthProvider( name, url, site.authHeader );
			} else { // OAuth1
				authProvider = createOauth1Provider(
					name, url,
					site.callbackUrl,
					site.publicKey || site.clientKey,
					site.secretKey,
				);
			}
			return createCoreApi( authProvider, name, `${ url }/wp-json/` );
		} )
	);
}

export const apis = APIs.map( api => api.name );
export const getDefault = () => APIs[ 0 ];
export const get = name => APIs.find( api => api.name === name ) || getDefault();
