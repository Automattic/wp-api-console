const isEnvelopedResponse = ( status, body, error ) => {
	if ( status !== 200 ) {
		return false;
	}

	if ( body && body.code && body.headers && 'body' in body ) {
		// Enveloped response from v1 API (?http_envelope=true)
		return true;
	}

	if ( body && body.status && body.headers && 'body' in body ) {
		// Enveloped response from v2 API (?_envelope)
		return true;
	}

	return false;
};

export const getResponseStatus = ( status, body, error ) => {
	if ( isEnvelopedResponse( status, body, error ) ) {
		return body.status || body.code || status;
	}

	return status;
};

export const getResponseError = ( rawStatus, rawBody, error, log = false ) => {
	const status = getResponseStatus( rawStatus, rawBody, error );
	if ( status >= 200 && status <= 299 && ! error ) {
		return null;
	}

	let body = rawBody;
	if ( isEnvelopedResponse( rawStatus, rawBody, error ) ) {
		body = rawBody.body;
	}

	if ( body && body.code ) {
		return body.code;
	} else if ( body && body.error ) {
		return body.error;
	} else {
		if ( error && log ) {
			console.log( 'Full error message:', error.message || error );
		}
		return 'Unknown error (check browser console)';
	}
};
