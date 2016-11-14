import { endpointSchema } from '../endpoints/schema';

const argsSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'.': {},
	},
};

const schema = {
	type: 'object',
	properties: {
		method: {
			type: 'string',
		},
		endpoint: {
			oneOf: [
				{ type: 'boolean' },
				endpointSchema,
			],
		},
		pathValues: argsSchema,
		queryParams: argsSchema,
		bodyParams: argsSchema,
		url: {
			type: 'string',
		},
	},
};

export default schema;
