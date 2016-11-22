import { compact } from 'lodash';

export const explodeEndpointPathParts = endpoint => {
	const pathRegex = /\$[^/]*|([^$]*)/g;
	const pathParts = endpoint.pathLabeled.match( pathRegex );

	return compact( pathParts );
};

export const getEndpointUrl = ( endpoint, pathValues ) => {
	const parts = explodeEndpointPathParts( endpoint );
	return parts.reduce(
		( url, part ) => url + ( part[ 0 ] === '$' ? pathValues[ part ] || '' : part )
		, ''
	);
};
