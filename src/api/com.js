import superagent from 'superagent';

const baseUrl = 'https://public-api.wordpress.com/rest/';

export const api = {
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
	loadVersions: () =>
		superagent.get( baseUrl + 'v1.1/versions?include_dev=true' )
			.set( 'accept', 'application/json' )
			.then( res => {
				return {
					versions: res.body.versions.map( version => `v${ version }` ),
					current: `v${ res.body.current_version }`,
				};
			} ),
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

const createApi = authProvider => {
	return {
		authProvider,
		...api,
	};
};

export default createApi;
