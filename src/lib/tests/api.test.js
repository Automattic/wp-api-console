import { getResponseStatus, getResponseError } from '../api';

describe( 'getResponseStatus', () => {
	it( 'should return the plain status code', () => {
		expect( getResponseStatus( 200, null, null ) ).toEqual( 200 );
		expect( getResponseStatus( 404, null, null ) ).toEqual( 404 );
	} );

	it( 'should return the enveloped status code (v1 API)', () => {
		const status = getResponseStatus( 200, {
			code: 404,
			headers: [],
			body: '',
		}, null );
		expect( status ).toEqual( 404 );
	} );

	it( 'should return the enveloped status code (v2 API)', () => {
		const status = getResponseStatus( 200, {
			status: 404,
			headers: [],
			body: '',
		}, null );
		expect( status ).toEqual( 404 );
	} );
} );

describe( 'getResponseError', () => {
	it( 'should return null if no error', () => {
		expect( getResponseError( 200, null, null ) ).toEqual( null );
		expect( getResponseError( 201, null, null ) ).toEqual( null );
	} );

	it( 'should process a plain error from the v1 API', () => {
		const error = getResponseError( 404, {
			error: 'something_bad',
		}, new Error() );
		expect( error ).toEqual( 'something_bad' );
	} );

	it( 'should process a plain error from the v2 API', () => {
		const error = getResponseError( 404, {
			code: 'something_bad',
		}, new Error() );
		expect( error ).toEqual( 'something_bad' );
	} );

	it( 'should return an unknown error if not 200', () => {
		const error = getResponseError( 404, null, null );
		expect( error ).toMatch( /^Unknown error/ );
	} );

	it( 'should return an unknown error if no body or status', () => {
		const error = getResponseError( null, null, new Error() );
		expect( error ).toMatch( /^Unknown error/ );
	} );

	it( 'should process an enveloped error from the v1 API', () => {
		const error = getResponseError( 200, {
			code: 404,
			headers: [],
			body: {
				error: 'something_bad',
			},
		}, null );
		expect( error ).toEqual( 'something_bad' );
	} );

	it( 'should process an enveloped error from the v2 API', () => {
		const error = getResponseError( 200, {
			status: 404,
			headers: [],
			body: {
				code: 'something_bad',
			},
		}, null );
		expect( error ).toEqual( 'something_bad' );
	} );
} );
