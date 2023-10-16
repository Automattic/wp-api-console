import superagent from 'superagent';

const createLocalAuthProvider = settings => {
	const { baseUrl, nonce, loggedInUserId } = settings;
	const boot = () => {
		if ( ! nonce ) {
			return Promise.reject();
		}

		const userUrl = `${ baseUrl }wp/v2/users/${ loggedInUserId }`;

		return superagent
			.get( userUrl )
			.set( 'accept', 'application/json' )
			.set( 'X-WP-Nonce', nonce )
			.then( res => {
				const user = res.body.body;
				return {
					...user,
					avatarUrl: '',
				};
			} );
	};

	const login = () => {
		if ( ! nonce ) {
			return Promise.reject( 'nonce not set' );
		}

		return Promise.resolve();
	};

	const request = ( { method, url, body } ) => {
		const req = superagent( method, url )
			.set( 'accept', 'application/json' )
			.set( 'X-WP-Nonce', nonce );

		if ( body && Object.keys( body ).length > 0 ) {
			req.send( body );
		}

		return new Promise( resolve =>
			req.end( ( err, response = {} ) => {
				resolve( {
					status: response.status,
					body: response.body,
					error: err,
				} );
			} )
		);
	};

	const logout = () => {};

	return {
		boot, login, logout, request,
	};
};

export default createLocalAuthProvider;
