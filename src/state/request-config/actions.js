import { REQUEST_CONFIG_APPLY } from '../actions';
import { boot } from '../security/actions';
import { parseRequestConfig } from '../../request-config/codec';
import { resolveRequestConfig } from '../../request-config/resolve';

export const createApplyRequestConfiguration = ( dependencies = {} ) => {
	const parse = dependencies.parseRequestConfig || parseRequestConfig;
	const resolve = dependencies.resolveRequestConfig || resolveRequestConfig;
	const bootRequest = dependencies.boot || boot;
	let latestApply = 0;

	return ( text, isCurrent = () => true ) => async dispatch => {
		const applyId = ++latestApply;
		const config = parse( text );
		const resolved = await resolve( config );
		if ( applyId !== latestApply || ! isCurrent() ) {
			return undefined;
		}

		dispatch( {
			type: REQUEST_CONFIG_APPLY,
			payload: resolved,
		} );
		dispatch( bootRequest( resolved.api ) );

		return resolved;
	};
};

export const applyRequestConfiguration = createApplyRequestConfiguration();
