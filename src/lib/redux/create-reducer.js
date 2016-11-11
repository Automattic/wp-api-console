import { DESERIALIZE, SERIALIZE } from './action-types';
import { isValidStateWithSchema } from './validate';
import warn from './warn';


/**
 * Returns a reducer function with state calculation determined by the result
 * of invoking the handler key corresponding with the dispatched action type,
 * passing both the current state and action object. Defines default
 * serialization (persistence) handlers based on the presence of a schema.
 *
 * @param  {*}        initialState   Initial state
 * @param  {Object}   customHandlers Object mapping action types to state
 *                                   action handlers
 * @param  {?Object}  schema         JSON schema object for deserialization
 *                                   validation
 * @return {Function}                Reducer function
 */
export function createReducer( initialState = null, customHandlers = {}, schema = null ) {
	// Define default handlers for serialization actions. If no schema is
	// provided, always return the initial state. Otherwise, allow for
	// serialization and validate on deserialize.
	let defaultHandlers;
	if ( schema ) {
		defaultHandlers = {
			[ SERIALIZE ]: state => state,
			[ DESERIALIZE ]: state => {
				if ( isValidStateWithSchema( state, schema ) ) {
					return state;
				}

				warn( 'state validation failed - check schema used for:', customHandlers );

				return initialState;
			},
		};
	} else {
		defaultHandlers = {
			[ SERIALIZE ]: () => initialState,
			[ DESERIALIZE ]: () => initialState,
		};
	}

	const handlers = {
		...defaultHandlers,
		...customHandlers,
	};

	// When custom serialization behavior is provided, we assume that it may
	// involve heavy logic (mapping, converting from Immutable instance), so
	// we cache the result and only regenerate when state has changed.
	if ( customHandlers[ SERIALIZE ] ) {
		let lastState;
		let lastSerialized;
		handlers[ SERIALIZE ] = ( state, action ) => {
			if ( state === lastState ) {
				return lastSerialized;
			}

			const serialized = customHandlers[ SERIALIZE ]( state, action );
			lastState = state;
			lastSerialized = serialized;
			return serialized;
		};
	}

	return ( state = initialState, action ) => {
		const { type } = action;

		if ( 'production' !== process.env.NODE_ENV && 'type' in action && ! type ) {
			throw new TypeError( 'Reducer called with undefined type.' +
				' Verify that the action type is defined in state/action-types.js' );
		}

		if ( {}.hasOwnProperty.call( handlers, type ) ) {
			return handlers[ type ]( state, action );
		}

		return state;
	};
}
