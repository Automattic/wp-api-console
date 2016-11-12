import superagent from 'superagent';

const createBasicAuthProvider = ( name, baseUrl, authHeader ) => {
	const boot = () => {
		if ( ! authHeader ) {
			return Promise.reject();
		}

		const userUrl = `${ baseUrl }/wp-json/wp/v2/users/me?_envelope`;

		return superagent
			.get( userUrl )
			.set( 'accept', 'application/json' )
			.set( 'Authorization', authHeader )
			.then( res => {
				const user = res.body.body;
				return {
					...user,
					avatarUrl: user.avatar_urls ? Object.values( user.avatar_urls )[ 0 ] : '',
				};
			} );
	};

	const login = () => {
		if ( ! authHeader ) {
			return Promise.reject( 'Basic auth header is not set' );
		}

		return Promise.resolve();
	};

	const request = ( { method, url, body } ) => {
		const req = superagent( method, url )
			.set( 'accept', 'application/json' );

		if ( body && Object.keys( body ).length > 0 ) {
			req.send( body );
		}

		req.set( 'Authorization', authHeader );

		return new Promise( resolve =>
			req.end( ( err, response = {} ) => {
				let error = err;
				if ( err && response.body && response.body.error ) {
					error = response.body.error;
				} else if ( err && response.error ) {
					error = response.error.message;
				}

				resolve( {
					status: response.status,
					body: response.body,
					error,
				} );
			} )
		);
	};

	const logout = () => {};

	return {
		boot, login, logout, request,
	};
};

export default createBasicAuthProvider;
