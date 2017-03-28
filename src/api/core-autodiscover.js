import { parseEndpoints } from './core';

const createApi = ( authProvider, name, url, namespaces = [ 'wp/v2' ] ) => {
	return {
		getDiscoveryUrl: version => `${ url }${ version }?context=help`,
		loadVersions: () => new Promise( resolve => authProvider.request( {
			method: 'GET',
			url,
		} ).then( ( res, err ) => {
			if ( err ) {
				return resolve( { versions: namespaces } );
			}
			const ns = res.body.namespaces;
			return resolve( { versions: ns } );
		} ) ),
		buildRequest: ( version, method, path, body ) => {
			return {
				url: url + version + path,
				apiNamespace: version,
				method,
				path,
				body,
			};
		},
		baseUrl: url,
		authProvider,
		name,
		parseEndpoints,
	};
};

export default createApi;
