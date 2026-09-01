export const getRequestConfigSource = state => {
	return {
		api: state.ui.api,
		version: state.ui.version,
		endpoint: state.request.endpoint,
		pathValues: state.request.pathValues,
		queryParams: state.request.queryParams,
		bodyParams: state.request.bodyParams,
	};
};
