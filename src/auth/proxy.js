import proxy from 'wpcom-proxy-request';

export const boot = () =>
	new Promise( ( resolve, reject ) => {
		proxy( { metaAPI: { accessAllUsersBlogs: true } }, err => {
			if ( err !== null ) {
				reject( err );
				throw err;
			}

			const timer = setTimeout( reject, 3000 );

			proxy( { path: '/me' }, ( err, response ) => {
				clearTimeout( timer );
				if ( err ) {
					reject();
					return;
				}
				if ( response.avatar_URL ) {
					response.avatarUrl = response.avatar_URL;
					delete response.avatar_URL;
				}
				resolve( response );
			} );
		} );
	} )
;

export const request = req =>
	new Promise( resolve => {
		proxy( req, ( err, body, xhr ) => {
			resolve( {
				status: xhr.status === undefined ? 200 : xhr.status,
				body,
				error: err,
			} );
		} );
	} )
;

export const login = () => {
	window.location = `https://wordpress.com/wp-login.php?redirect_to=${ encodeURI( window.location.href ) }`;
};

export const logout = () => {
	window.location = `https://wordpress.com/wp-login.php?action=logout&redirect_to=${ encodeURI( window.location.href ) }`;
};
