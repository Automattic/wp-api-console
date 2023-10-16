/**
 * @typedef {object} NamedCaptureGroup
 * @property {string} name Name given in named capture group.
 * @property {string} pattern Pattern specifying match of capture group.
 * @property {number} start String index into pattern where capture group starts.
 * @property {number} end String index into pattern where capture group ends.
 */

/**
 * Replaces special syntax in a PCRE pattern to avoid
 * confusion when parsing its structure and nesting.
 *
 * By replacing syntax in an early pass we can simplify
 * our parser to detect the closing parenthesis for a
 * given named capture group. The only parentheses left
 * after this flattening should be those which open or
 * close a new or nested group/syntax.
 *
 * Using an equal number of `_` for each replacement
 * leaves the original string indices unchanged.
 *
 * @example
 *     p = 'A \[ indicates a capture group.'
 *     p = flattenNonNestingSyntax( p )
 *     p = 'A __ indicates a capture group.'
 *
 *     p = '(\[[a-z0-9()]\])'
 *     p = flattenNonNestingSyntax( p )
 *     p = '(______________)'
 *
 * @param {string} pcrePattern The pattern to flatten.
 * @return {string} Version of the pattern with non-structural syntax replaced.
 **/
const flattenNonNestingSyntax = pcrePattern =>
    pcrePattern
		// Replace `\\` with `__`
        .replace( /\\{2}/g, '__' )

		// Replace `\(`, `\)`, `\[`, and `\]` with `__`
        .replace( /\\{1}[[\]()]{1}/g, '__' )

		// Replace unescaped CharacterClassEnd with `_`:
		// `[[a-z]` and `[^[]` with `[_a-z]` and `[^_a-z]`
        // Note that this is different in PCRE than in JavaScript RegExp.
        .replace( /(\[\^?)\]/g, '$1_' )

		// Wipe out character groups because those also don't change the
		// structure but they might contain unescaped parentheses.
        .replace( /\[[^\]]*\]/g, fullMatch => '_'.repeat( fullMatch.length ) );


/**
 * Find the string index at which a parenthesized group ends.
 *
 * Once we open a parenthesized group we want to find the closing
 * `)` for that subgroup. We truly want more complete PCRE pattern
 * parsing, but given that it doesn't exist in the standard library
 * we're going to take a shortcut here and parse enough of the
 * syntax to avoid getting lost on common patterns (specifically
 * on subgroups). To that end we're going to start looking for
 * balanced subgroups and only return the index of the closing
 * parenthesis that we believe is matching the one that opened
 * the named capture group.
 *
 * @param {string} pcrePattern Full PCRE pattern under analysis.
 * @param {number} offset String index at which to start searching for closer.
 * @param {number} depth Track the nesting depth to know which closer is the right one.
 * @return {number} String index of terminal `)` for balanced parenthesis closer.
 */
const findClosingParenthesis = ( pcrePattern, offset, depth = 0 ) => {
	const tokens = /[()]/g;
	tokens.lastIndex = offset;

    // Ignore all escaped syntax because those don't change state inside the pattern.
	const flattened = offset === 0
		? flattenNonNestingSyntax( pcrePattern )
		: pcrePattern;

	const next = tokens.exec( flattened );
	if ( null === next ) {
		throw Error( 'Could not find closing ")" for matching group' );
	}

	const token = next[ 0 ];
	if ( ')' === token && 0 === depth ) {
		return tokens.lastIndex;
	}

	const depthChange = '(' === token ? 1 : -1;
	return findClosingParenthesis( flattened, tokens.lastIndex, depth + depthChange );
};


/**
 * Return listing of named capture groups found in a PCRE pattern.
 *
 * @example
 *     getNamedCaptureGroups( '(?P<line_number>\d+): (?P<severity>\w+)$' ) === [
 *         { name: 'line_number', pattern: '\d+', start: 0, end: 19 },
 *         { name: 'severity', pattern: '\w+', start: 21, end: 37 },
 *     ]
 *
 * @param {string} pcrePattern PCRE pattern potentially containing named capture groups.
 * @return {ParameterDescriptor[]} Named capture groups and the offsets where they are found.
 */
export const getNamedCaptureGroups = pcrePattern => {
	/** This pattern matches named capture group openers with their name. */
	const captureGroupName = /\(\?(?:P?<([a-zA-Z_][a-zA-Z0-9_]*)>|'([a-zA-Z_][a-zA-Z0-9_]*)')/g;
	//                                  ------------------------   ------------------------
	//                                  (?P<submatch_1>...)        (?'submatch_2'...)
	const captureGroups = [];

	let match = null;
	// eslint-disable-next-line
	while ( null !== ( match = captureGroupName.exec( pcrePattern ) ) ) {
		// Depending on the syntax we could have the first or the second kind of submatch.
		const name = match[ 1 ] ? match[ 1 ] : match[ 2 ];

		const end = findClosingParenthesis( pcrePattern, captureGroupName.lastIndex );
		const pattern = pcrePattern.slice( captureGroupName.lastIndex, end - 1 );

		captureGroups.push( { name, pattern, start: match.index, end } );
	}

	return captureGroups;
};
