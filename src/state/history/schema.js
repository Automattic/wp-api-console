import { endpointSchema } from '../endpoints/schema';

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
