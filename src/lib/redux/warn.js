let warn;

if ( process.env.NODE_ENV !== 'production' && 'function' === typeof console.warn ) {
	warn = ( ...args ) => console.warn( ...args );
} else {
	warn = () => {};
}

export default warn;
