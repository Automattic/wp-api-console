const schema = {
	type: 'object',
	properties: {
		version: {
			oneOf: [
				{ type: 'string' },
				{ type: 'null' },
			],
		},
		api: {
			type: 'string',
		},
	},
};

export default schema;
