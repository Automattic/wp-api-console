import validator from 'is-my-json-valid';

import warn from './warn';

export function isValidStateWithSchema(state, schema) {
	const validate = validator(schema);
	const valid = validate(state);
	if (! valid) {
		warn('state validation failed for state:', state, 'with reason:', validate.errors);
	}
	return valid;
}
