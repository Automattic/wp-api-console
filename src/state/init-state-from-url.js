import { selectApi, selectVersion } from './ui/actions';
import { updateMethod, updateUrl } from './request/actions';

function initStateFromUrl( store ) {
	const requestUrl = new URL( window.location );
	const api = requestUrl.searchParams.get( 'api' );
	const version = requestUrl.searchParams.get( 'version' );
	const method = requestUrl.searchParams.get( 'method' );
	const url = requestUrl.searchParams.get( 'url' );
	if ( api ) {
		store.dispatch( selectApi( api ) );
	}
	if ( version ) {
		store.dispatch( selectVersion( version ) );
	}
	if ( method ) {
		store.dispatch( updateMethod( method ) );
	}
	if ( url ) {
		store.dispatch( updateUrl( url ) );
	}
}
export default initStateFromUrl;
