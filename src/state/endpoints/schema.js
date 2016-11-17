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
	additionalProperties: false,
	properties: {
		pathFormat: {
			type: 'string',
			required: true,
		},
		pathLabeled: {
			type: 'string',
			required: true,
		},
		description: {
			type: 'string',
		},
		group: {
			type: 'string',
		},
		method: {
			type: 'string',
			required: true,
		},
		request: {
			type: 'object',
			properties: {
				body: argsSchema,
				query: argsSchema,
				path: argsSchema,
			},
		},
		response: {
			type: 'object',
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
