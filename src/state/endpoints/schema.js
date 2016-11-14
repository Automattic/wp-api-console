const argsSchema = {
	oneOf: [
		{
			type: 'object',
			additionalProperties: false,
			patternProperties: {
				'.': {
					type: 'object',
					properties: {
						type: {
							type: 'string',
						},
						description: {
							oneOf: [
								{ type: 'string' },
								{
									type: 'object',
									additionalProperties: false,
									patternProperties: {
										'.': {
											type: 'string',
										},
									},
								},
							],
						},
					},
				},
			},
		},
		{ type: 'array' },
	],
};

export const endpointSchema =  {
	type: 'object',
	properties: {
		pathFormat: {
			type: 'string',
		},
		pathLabeled: {
			type: 'string',
		},
		description: {
			type: 'string',
		},
		group: {
			type: 'string',
		},
		method: {
			type: 'string',
		},
		request: {
			type: 'object',
			properties: {
				body: argsSchema,
				query: argsSchema,
				path: argsSchema,
			},
		},
	},
};

const schema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		// ApiName
		'.': {
			type: 'object',
			additionalProperties: false,
			patternProperties: {
				// Version
				'.': {
					type: 'array',
					items: endpointSchema,
				},
			},
		},
	},
};

export default schema;
