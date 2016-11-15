import { isArray, isPlainObject, isString, toPairs, toString } from 'lodash';

const MAX_LENGTH = 60;

const escapeHTML = html => {
	const replacements = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
	};

	return html.replace( /[&<>]/g, ch => replacements[ ch ] );
};

const escapeLikeJSON = value => {
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

const recursiveStringify = ( data, max = MAX_LENGTH ) => {
	if ( isPlainObject( data ) || isArray( data ) ) {
		const pairs = toPairs( data );

		let output = isArray( data ) ? '[ ' : '{ ';
		let trailing = '';
		let length = 2;
		for ( const [ key, value ] of pairs ) {
			const keyString = escapeLikeJSON( escapeHTML( key.toString() ) );
			output += trailing;
			output += '<span class="key">' + keyString + '</span>: ';
			const recursion = recursiveStringify( value );
			output += recursion.output;
			length += keyString.length + trailing.length + recursion.length;
			trailing = ', ';
			if ( length > max ) {
				output += isArray( data ) ? ' …]' : ' …}';
				return {
					length: length + 3,
					output,
				};
			}
		}
		return {
			output: output + ( isArray( data ) ? ' ]' : ' }' ),
			length: length + 2,
		};
	}

	if ( isString( data ) ) {
		const displayValue = escapeLikeJSON( escapeHTML( data ) );
		return {
			length: data.length + 2,
			output: '<span class="string">"' + displayValue + '"</span>',
		};
	}

	return {
		length: toString( data ).length,
		output: '<span class="' + ( typeof data ) + '">' + data + '</span>',
	};
};

export const stringify = ( data, max = MAX_LENGTH ) =>
	recursiveStringify( data, max ).output;
