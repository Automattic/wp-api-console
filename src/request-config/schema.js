const valuesSchema = {
	type: 'object',
	additionalProperties: true,
};

export default {
	type: 'object',
	additionalProperties: false,
	required: [ 'schemaVersion', 'request' ],
	properties: {
		schemaVersion: {
			type: 'number',
			enum: [ 1 ],
		},
		request: {
			type: 'object',
			additionalProperties: false,
			required: [
				'api',
				'version',
				'method',
				'endpoint',
				'pathValues',
				'queryParams',
				'bodyParams',
			],
			properties: {
				api: { type: 'string', minLength: 1 },
				version: { type: 'string', minLength: 1 },
				method: { type: 'string', minLength: 1 },
				endpoint: { type: 'string', minLength: 1 },
				pathValues: valuesSchema,
				queryParams: valuesSchema,
				bodyParams: valuesSchema,
			},
		},
	},
};
