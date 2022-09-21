import { getNamedCaptureGroups as get } from '../pcre-parser';

describe( 'getNamedCaptureGroups', () => {
	it( 'returns an empty array when no named capture groups are present', () => {
		expect( get( 'simple pattern' ) ).toEqual( [] );
		expect( get( '\\d+' ) ).toEqual( [] );
		expect( get( '[a-z0-9]*' ) ).toEqual( [] );
	} );

	it( 'finds basic named capture groups', () => {
		expect( get( '.*?: (?P<log_line>.*)' ) ).toEqual( [ expect.objectContaining( { name: 'log_line', pattern: '.*' } ) ] );
		expect( get( '.*?: (?<log_line>.*)' ) ).toEqual( [ expect.objectContaining( { name: 'log_line', pattern: '.*' } ) ] );
		expect( get( '.*?: (?\'log_line\'.*)' ) ).toEqual( [ expect.objectContaining( { name: 'log_line', pattern: '.*' } ) ] );
	} );

	it( 'returns named capture groups in the order they appear', () => {
		expect( get( '(?P<trigger>+?): (?\'line_number\'\\d+) (?<message>.*)$' ) )
            .toEqual( [
				expect.objectContaining( { name: 'trigger', pattern: '+?' } ),
				expect.objectContaining( { name: 'line_number', pattern: '\\d+' } ),
				expect.objectContaining( { name: 'message', pattern: '.*' } ),
			] );
	} );

	it( 'ignores non-named capture groups', () => {
		expect( get( '(one)(two)' ) ).toEqual( [] );
		expect( get( '(?:non-capturing)' ) ).toEqual( [] );
		expect( get( '(?:(<!<--).)*-->' ) ).toEqual( [] );
		expect( get( '(?p<case_sensitive>syntax)' ) ).toEqual( [] );
	} );

	it( 'understands escaping and nested syntax', () => {
		expect( get( '(?P<syntax>\\(|\\)|\\[|\\])' ) )
            .toEqual( [ expect.objectContaining( { name: 'syntax', pattern: '\\(|\\)|\\[|\\]' } ) ] );

		expect( get( '(?P<digits>[0-9_()])' ) )
            .toEqual( [ expect.objectContaining( { name: 'digits', pattern: '[0-9_()]' } ) ] );

		expect( get( '/wpcom/v2/jetpack-boost-proxy/(?P<version>(?:v\\d+/)?)metrics' ) )
            .toEqual( [ expect.objectContaining( { name: 'version', pattern: '(?:v\\d+/)?' } ) ] );

		expect( get(
            '/sites/(?P<wpcom_site>[\\w.:-]+)/global-styles/themes/(?P<stylesheet>[\\/\\s%\\w\\.\\(\\)\\[\\]\\@_\\-]+)/variations'
        ) ).toEqual( [
			expect.objectContaining( { name: 'wpcom_site', pattern: '[\\w.:-]+' } ),
			expect.objectContaining( { name: 'stylesheet', pattern: '[\\/\\s%\\w\\.\\(\\)\\[\\]\\@_\\-]+' } ),
		] );
	} );
} );
