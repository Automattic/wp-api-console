export class RequestConfigError extends Error {
	constructor( code, message, details = [] ) {
		super( message );
		this.name = 'RequestConfigError';
		this.code = code;
		this.details = details;
	}
}
