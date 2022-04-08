import { isPlainObject } from '../../lib/utils';

const MAX_LENGTH = 60;

export const escapeHTML = html => {
	const replacements = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
	};

	return html.replace( /[&<>]/g, ch => replacements[ ch ] );
};

export const escapeLikeJSON = value => {
	const replacements = {
		'\r': '\\r',
		'\n': '\\n',
		'\t': '\\t',
		'"': '\\"',
	};

	return value
		// Replace backslashes first to avoid doubling them in other places.
		.replace( /\\/g, '\\\\' )
		// Then replace everything else (multiple spaces are handled via CSS).
		.replace( /\r|\n|\t|"/g, ch => replacements[ ch ] );
};

const toPairs = data => {
	if ( ! data ) {
		return [];
	}

	return Object.keys( data ).map( key => [ key, data[ key ] ] );
};

const recursiveStringify = ( data, max = MAX_LENGTH ) => {
	if ( isPlainObject( data ) || Array.isArray( data ) ) {
		const pairs = toPairs( data );

		let output = Array.isArray( data ) ? '[ ' : '{ ';
		let trailing = '';
		let length = 2;
		let keysRendered = 0;
		for ( const [ key, value ] of pairs ) {
			const keyString = escapeLikeJSON( escapeHTML( key.toString() ) );
			output += trailing;
			output += '<span class="key">' + keyString + '</span>: ';
			const recursion = recursiveStringify( value );
			output += recursion.output;
			length += keyString.length + trailing.length + recursion.length;
			keysRendered++;
			trailing = ', ';
			if ( length > max && keysRendered < pairs.length ) {
				output += Array.isArray( data ) ? ' …]' : ' …}';
				return {
					length: length + 3,
					output,
				};
			}
		}
		return {
			output: output + ( Array.isArray( data ) ? ' ]' : ' }' ),
			length: length + 2,
		};
	}

	if ( 'string' === typeof data ) {
		const displayValue = escapeLikeJSON( escapeHTML( data ) );
		return {
			length: data.length + 2,
			output: '<span class="string">"' + displayValue + '"</span>',
		};
	}

	return {
		length: data ? data.toString().length : 0,
		output: '<span class="' + ( typeof data ) + '">' + data + '</span>',
	};
};

export const stringify = ( data, max = MAX_LENGTH ) =>
	recursiveStringify( data, max ).output;
