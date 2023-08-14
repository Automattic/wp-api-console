import React, { Component } from 'react';
import { connect } from 'react-redux';

import './style.css';
import { getSelectedVersion, getSelectedApi } from '../../state/ui/selectors';
import { getMethod, getUrl } from '../../state/request/selectors';
import { selectVersion } from '../../state/ui/actions';
import { loadVersions } from '../../state/versions/actions';
import useClipboard from './use-clipboard';

function createURLWithArgs( baseURL, args ) {
	const url = new URL( baseURL );
	const params = new URLSearchParams();
	
	// Append each key-value pair from the 'args' object as query parameters
	for (const key in args) {
		if (args.hasOwnProperty(key)) {
			params.append(key, args[key]);
		}
	}
	
	url.search = params.toString();
	return url.toString();
}

const ShareRequest = ( { api, version, path, method } ) => {
	const { isSupported, copyToClipboard } = useClipboard();
	
	if ( ! isSupported ) {
		return null;
	}
	
	const handleCopyClick = () => {
		const urlToCopy = createURLWithArgs( window.location.href, { api, version, path, method } );
		copyToClipboard( urlToCopy );
	};
	
	return (
		<div id="share-request" onClick={ handleCopyClick }></div>
	);
};
	
export default connect(
	state => {
		const api = getSelectedApi( state );
		const version = getSelectedVersion( state, api );
		
		return {
			api,
			version,
			path: getUrl( state ),
			method: getMethod( state ),
		};
	},
	{ selectVersion, loadVersions }
)( ShareRequest );
