const objectCtorString = Function.prototype.toString.call( Object );

export function isPlainObject( value ) {
	if (
		value === null ||
		value === undefined ||
		typeof value !== 'object' ||
		value.toString() !== '[object Object]'
	) {
		return false;
	}

	const proto = Object.getPrototypeOf( Object( value ) );
	if ( proto === null ) {
		return true;
	}

	const Ctor = Object.hasOwnProperty.call( proto, 'constructor' ) && proto.constructor;
	return (
        typeof Ctor === 'function' &&
        Ctor instanceof Ctor &&
		Function.prototype.toString.call( Ctor ) === objectCtorString
	);
}

/**
 * Get a query parameter from the URL.
 *
 * @param {*} param The name of the query parameter to get.
 * @returns string|null
 */
export function getParam( param ) {
	const urlParams = new URLSearchParams( window.location.search );
	return urlParams.get( param );
}