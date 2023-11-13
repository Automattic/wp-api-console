import React, { useState } from 'react';
import { connect } from 'react-redux';

import './style.css';

const Share = ( { api, version, method, url, pathLabeled, pathValues, queryParams } ) => {
	const [ buttonText, setButtonText ] = useState( 'Share' );

	// The API console has two methods, 1. Directly type in the URL, 2. Use the form to build the URL.
	// I'm calling 2 the "madlibs" method, because it's like filling in the blanks of a story.
	// This function constructs the madlibs path if we can't use the direct request.url.
	const constructMadlibsPath = () => {
		let path = pathLabeled;
		Object.keys( pathValues ).forEach( ( key ) => {
			path = path.replace( key, encodeURIComponent( pathValues[ key ] ) );
			console.log( key, pathValues[ key ], path );
		} );
		if ( queryParams ) {
			const queryParamsString = new URLSearchParams( queryParams ).toString();
			path += `?${ queryParamsString }`;
		}
		return path;
	};

	const buildShareableLink = () => {
		const finalPath = url || constructMadlibsPath();
		const baseUrl = window.location.origin;
		const queryParams = new URLSearchParams( { api, version, method, url: finalPath } ).toString();
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
	pathValues: state.request?.pathValues,
	queryParams: state.request?.queryParams,
	pathLabeled: state.request?.endpoint?.pathLabeled,
} );

export default connect( mapStateToProps )( Share );
