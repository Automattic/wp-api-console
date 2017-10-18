const baseUrl = 'https://public-api.wordpress.com/rest/';

const createApi = authProvider => {
	return {
		authProvider,
		name: 'WP.COM API',
		getDiscoveryUrl: version => baseUrl + version + '/help',
		parseEndpoints: data => {
			const documented = [];
			const undocumented = [];
			const noGroup = [];
			data.forEach( endpoint => {
				endpoint.pathFormat = endpoint.path_format;
				delete endpoint.path_format;
				endpoint.pathLabeled = endpoint.path_labeled;
				delete endpoint.path_labeled;
				if ( endpoint.group === '__do_not_document' ) {
					undocumented.push( endpoint );
				} else if ( endpoint.group ) {
					documented.push( endpoint );
				} else {
					noGroup.push( endpoint );
				}
			} );
			return documented.concat( noGroup ).concat( undocumented );
		},
		loadVersions: () => {
			const loadVersions = () =>
				authProvider.request( {
					method: 'GET',
					url: baseUrl + 'v1.1/versions?include_dev=true',
					path: '/versions',
					apiVersion: '1.1',
				} ).then( res => {
					return {
						versions: res.body.versions.map( version => `v${ version }` ),
						current: `v${ res.body.current_version }`,
					};
				} );

			return authProvider.boot()
				.then( loadVersions )
				.catch( loadVersions );
		},
		buildRequest: ( version, method, path, body ) => {
			return {
				url: baseUrl + version + path,
				apiVersion: version.substr( 1 ),
				method,
				path,
				body,
			};
		},
		baseUrl,
	};
};

export default createApi;
