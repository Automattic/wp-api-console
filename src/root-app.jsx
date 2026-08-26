import React from 'react';

import App from './app';

const V2App = React.lazy( () => import( './v2/app' ) );

export const getAppVersion = pathname => /^\/v2\/?$/.test( pathname ) ? 'v2' : 'v1';

const RootApp = ( { pathname = window.location.pathname } ) => {
	if ( 'v2' === getAppVersion( pathname ) ) {
		return (
			<React.Suspense fallback={ null }>
				<V2App />
			</React.Suspense>
		);
	}

	return <App />;
};

export default RootApp;
