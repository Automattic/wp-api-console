import React from 'react';

import App from './app';
import V2App from './v2/app';

export const getAppVersion = pathname => /^\/v2\/?$/.test( pathname ) ? 'v2' : 'v1';

const RootApp = ( { pathname = window.location.pathname } ) => {
	const SelectedApp = 'v2' === getAppVersion( pathname ) ? V2App : App;

	return <SelectedApp />;
};

export default RootApp;
