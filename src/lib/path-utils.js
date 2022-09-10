/**
 * @typedef {object} ParameterDescriptor
 * @property {string} name Name of endpoint parameter.
 * @property {string} pattern Validates values of the parameter.
 * @property {number} start String index into endpoint pattern where parameter descriptor starts.
 * @property {number} end String index into endpoint pattern where parameter descriptor ends.
 */

/**
 * Find the string index at which a parameter descriptor ends.
 *
 * Once we find a parameter descriptor opening we want to find
 * the closing `)` for that subgroup. These are all PCRE patterns.
 * We truly want more complete PCRE pattern parsing, but given that
 * it doesn't exist in the standard library we're going to take a
 * shortcut here and parse enough of the syntax to avoid getting
 * lost on common patterns (specifically on subgroups). To that end
 * we're going to start looking for balanced subgroups and only
 * return the index of the closing parenthesis that we believe is
 * matching the one that opened the named capture group.
 * 
 * @param {string} endpointPattern Full endpoint URL including parameter patterns.
 * @param {number} offset String index at which to start searching for closer.
 * @param {number} depth Track the nesting depth to avoid confusing a balanced subgroup with the param closer.
 * @return {number} String index of terminal `)` on parameter descriptor (named capture group in input PCRE pattern).
 */
export const findParamCloser = ( endpointPattern, offset, depth = 0 ) => {
    const tokens = /[()]/g;
    tokens.lastIndex = offset;

    const next = tokens.exec( endpointPattern );
    if ( null === next ) {
        throw Error('Could not find closing ")" for matching group');
    }

    const token = next[0];

    // Escaped parenthesis are literal matches and not groups.
    // They might not be balanced.
    if ( '\\' === endpointPattern[ next.offset - 1 ] ) {
        return findParamCloser( endpointPattern, tokens.lastIndex, depth );
    }

    // @TODO: We could find unbalanced parenthesis inside character
    //        groups, so really we should be doing more complete
    //        PCRE pattern parsing. E.g. `(?<template>\d+[()-_])`
    if ( ')' === token && 0 === depth ) {
        return tokens.lastIndex;
    }

    const depthChange = '(' === token ? 1 : -1;
    return findParamCloser( endpointPattern, tokens.lastIndex, depth + depthChange );
}

/**
 * Return recognized endpoint parameters given a URL with its path.
 * 
 * Endpoint parameters are typically specified with a PCRE named
 * capture group of the form `(?P<param_name>MATCHING_PATTERN)`.
 * This function extracts these groups from the endpoint URL and
 * returns the name of the parameter as well as the PCRE pattern
 * (MATCHING_PATTERN) which validates the allowable inputs for
 * that parameter.
 * 
 * @param {string} endpointPattern Full endpoint URL including parameter patterns.
 * @return {ParameterDescriptor[]} Parsed parameters from endpoint pattern.
 */
export const parseParams = endpointPattern => {
    const parameterPattern = /\(\?P<([^>]+)>/g;
    const params = [];

    let match = null;
    // eslint-disable-next-line
    while ( null !== ( match = parameterPattern.exec( endpointPattern ) ) ) {
        const name = match[1];

        const end = findParamCloser( endpointPattern, parameterPattern.lastIndex );
        const pattern = endpointPattern.slice( parameterPattern.lastIndex, end - 1 );

        params.push( { name, pattern, start: match.index, end } );
    }

    return params;
}
