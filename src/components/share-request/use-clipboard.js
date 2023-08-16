const useClipboard = () => {
	const isSupported = !!navigator.clipboard;
	
	const fallbackCopyToClipboard = ( text ) => {
		const textarea = document.createElement('textarea');
		textarea.value = text;
		textarea.style.position = 'fixed'; // Keep off-screen
		document.body.appendChild( textarea );
		textarea.focus();
		textarea.select();
		
		try {
			const successful = document.execCommand( 'copy' );
			if ( successful ) {
				console.log( 'Text added to clipboard successfully!' );
			} else {
				console.error( 'Failed to add text to clipboard.' );
			}
		} catch ( err ) {
			console.error( 'Failed to add text to clipboard:', err );
		}
		
		document.body.removeChild( textarea ); // Clean up
	};
	
	const copyToClipboard = async ( text ) => {
		try {
			if ( isSupported ) {
				await navigator.clipboard.writeText( text );
				console.log( 'Text added to clipboard successfully!' );
			} else {
				fallbackCopyToClipboard( text );
			}
		} catch (err) {
			console.error( 'Failed to add text to clipboard:', err );
		}
	};
	
	return { isSupported, copyToClipboard };
};

export default useClipboard;