import React from 'react';
import ResultsViewSelector from '../results-view-selector';

import './style.css';

const RequestHeader = ( { result: { loading, request: { path, method, apiName, version }, duration, response }, view, onViewChange } ) => {
	const filename = path
			.replace( /^\//, '' )
			.replace( /\//g, '-' ) + '.json';

	const copyToClipboard = () => {
		navigator.clipboard.writeText( JSON.stringify( response.body, null, '\t' ) );
	};

	return (
		<div className="request-header">
			<code className="apiName">{ apiName }</code>
			<code className="method">{ method }</code>
			<code className="path">{ `${ version }${ path }` }</code>
			{ response && <ResultsViewSelector view={ view } onViewChange={ onViewChange } /> }
			{ response && !! response.error && (
				<span className="error">
					{ response.status && `${ response.status } - ` }
					{ response.error }
				</span>
			) }
			{ duration && (
				<span className="duration">{ `${ duration }ms` }</span>
			) }
			{ response && !! response.body && (
				<div>
					<a
						className="download"
						title="Download"
						target="_blank"
						download={ filename }
						rel="noreferrer noopener"
						href={ 'data:application/json;charset=UTF-8,' + encodeURIComponent( JSON.stringify( response.body, null, '\t' ) ) }
					/>
					<span
						onClick={ copyToClipboard }
						className="copy"
						title="Copy to clipboard"
					/>
				</div>
			) }
			{ loading && (
				<div className="throbber"><div /></div>
			) }
		</div>
	);
};

export default RequestHeader;
