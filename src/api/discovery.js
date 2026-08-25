import superagent from 'superagent';

export const fetchEndpoints = ( api, version, http = superagent ) => {
	return http
		.get( api.getDiscoveryUrl( version ) )
		.set( 'accept', 'application/json' )
		.then( ( res ) => api.parseEndpoints( res.body ) );
};
