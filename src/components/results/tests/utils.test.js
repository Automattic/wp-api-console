import { stringify } from '../utils';

it( 'should stringify an object recursively', () => {
	const object = {
		a: 'b',
		c: {
			d: 'e',
		},
	};
	const expected = '{<span class="key">"a"</span>:<span class="string">"b"</span>, <span class="key">"c"</span>:{<span class="key">"d"</span>:<span class="string">"e"</span>}}';  // eslint-disable-line max-len
	expect( stringify( object ) ).toEqual( expected );
} );


it( 'should stringify an array recursively', () => {
	const object = [
		'a',
		'b',
		[ 'c', 'd' ],
	];
	const expected = '[<span class="key">"0"</span>:<span class="string">"a"</span>, <span class="key">"1"</span>:<span class="string">"b"</span>, <span class="key">"2"</span>:[<span class="key">"0"</span>:<span class="string">"c"</span>, <span class="key">"1"</span>:<span class="string">"d"</span>]]';  // eslint-disable-line max-len
	expect( stringify( object ) ).toEqual( expected );
} );

it( 'should crop the output if we exceed max', () => {
	const object = {
		a: 'b',
		c: {
			d: 'e',
		},
	};
	const expected = '{<span class="key">"a"</span>:<span class="string">"b"</span> …}';
	expect( stringify( object, 5 ) ).toEqual( expected );
} );
