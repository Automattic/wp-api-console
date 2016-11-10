import React from 'react';

import './style.css';

const RequestHeader = ( { result: { loading, request: { path, method, apiName, version }, duration, response } } ) => {
	let filename = path;
	if ( filename.indexOf( '/' ) === 0 ) {
		filename = filename.slice( 1 );
	}
	filename = filename.replace( /\//g, '-' ) + '.json';

	return (
		<div className="request-header">
			<code className="apiName">{ apiName }</code>
			<code className="method">{ method }</code>
			<code className="path">{ `${ version }${ path }` }</code>
			{ response && !! response.error && <span className="error">{ `${ response.status } - ${ response.error }` }</span> }
			{ duration && <span className="duration">{ `${ duration }ms` }</span> }
			{ response && !! duration.body &&
				<a
					className="download"
					title="Download"
					target="_blank"
					download={ filename }
					rel="noreferrer noopener"
					href={ 'data:application/json;charset=UTF-8,' + encodeURIComponent( JSON.stringify( response.body, null, '\t' ) ) }
				/>
			}
			{ loading && <div className="throbber"><div /></div> }
		</div>
	);
};

export default RequestHeader;
