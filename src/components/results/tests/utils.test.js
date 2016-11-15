import { stringify } from '../utils';

it( 'should stringify an object recursively', () => {
	const object = {
		a: 'b',
		c: {
			d: 'e',
		},
	};
	const expected = '{ <span class="key">a</span>: <span class="string">"b"</span>, <span class="key">c</span>: { <span class="key">d</span>: <span class="string">"e"</span> } }';  // eslint-disable-line max-len
	expect( stringify( object ) ).toEqual( expected );
} );


it( 'should stringify an array recursively', () => {
	const object = [
		'a',
		'b',
		[ 'c', 'd' ],
	];
	const expected = '[ <span class="key">0</span>: <span class="string">"a"</span>, <span class="key">1</span>: <span class="string">"b"</span>, <span class="key">2</span>: [ <span class="key">0</span>: <span class="string">"c"</span>, <span class="key">1</span>: <span class="string">"d"</span> ] ]';  // eslint-disable-line max-len
	expect( stringify( object ) ).toEqual( expected );
} );

it( 'should crop the output if we exceed max', () => {
	const object = {
		a23456: 'b23456',
		c23456: {
			d23456: 'e23456',
		},
	};
	const expected = '{ <span class="key">a23456</span>: <span class="string">"b23456"</span> …}';
	expect( stringify( object, 5 ) ).toEqual( expected );
} );

it( 'should encode HTML-like characters in keys and values', () => {
	const object = {
		'<': 'some stuff & more stuff',
		'>': '<_< >_>',
		'&': 'another "<test>"',
	};
	const expected = '{ ' +
		'<span class="key">&lt;</span>: <span class="string">"some stuff &amp; more stuff"</span>, ' +
		'<span class="key">&gt;</span>: <span class="string">"&lt;_&lt; &gt;_&gt;"</span>, ' +
		'<span class="key">&amp;</span>: <span class="string">"another \\"&lt;test&gt;\\""</span> ' +
		'}';
	expect( stringify( object, 999 ) ).toEqual( expected );
} );
