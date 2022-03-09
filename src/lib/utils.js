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
