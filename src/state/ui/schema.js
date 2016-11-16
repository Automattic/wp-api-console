const schema = {
	type: 'object',
	properties: {
		version: {
			oneOf: [
				{ type: 'string', required: true },
				{ type: 'null', required: true },
			],
		},
		api: {
			type: 'string',
			required: true,
		},
	},
};

export default schema;
