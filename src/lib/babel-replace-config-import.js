module.exports = babel => {
	return {
		visitor: {
			ImportDeclaration: ( path, state ) => {
				if ( path.node.source.value === '../config' ) {
					path.node.source = babel.types.stringLiteral( '../config.wpcom' );
					console.log( 'Overrode config for WP.com build' );
				}
			},
		},
	};
};
