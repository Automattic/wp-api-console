import React, { useState } from 'react';
import { connect } from 'react-redux';

import './style.css';

const Share = ( { api, version, method, url } ) => {
	const [ buttonText, setButtonText ] = useState( 'Share' );

	const buildShareableLink = () => {
		const baseUrl = window.location.href.split( '?' )[ 0 ];
		const queryParams = new URLSearchParams( { api, version, method, url } ).toString();
		const shareableUrl = `${ baseUrl }?${ queryParams }`;

		navigator.clipboard
			.writeText( shareableUrl )
			.then( () => {
				setButtonText( 'Copied!' );
				setTimeout( () => setButtonText( 'Share' ), 2000 );
			} )
			.catch( ( err ) => console.error( 'Error copying URL to clipboard', err ) ); // Error handling
	};

	return (
		<button id="share-button" onClick={ buildShareableLink }>
			{ buttonText }
		</button>
	);
};

const mapStateToProps = ( state ) => ( {
	api: state.ui.api,
	version: state.ui.version,
	method: state.request.method,
	url: state.request.url,
} );

export default connect( mapStateToProps )( Share );
