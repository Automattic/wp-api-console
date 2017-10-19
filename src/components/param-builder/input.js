import React from 'react';
import { isString } from 'lodash';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';

export default function ParamInput( { onChange, type, value, ...props } ) {
	switch ( type ) {
		case 'array':
			return (
				<TagsInput
					value={ value || [] }
					inputProps={ {
						placeholder: 'Add a value',
						...props,
					} }
					onChange={ onChange }
				/>
			);
		case 'object':
			const stringifiedValue = isString( value ) ? value : JSON.stringify( value );
			const onChangeObject = event => {
				const eventValue = event.target.value;
				const parsedValue = eventValue.length && eventValue[ 0 ] === '{'
					? JSON.parse( eventValue )
					: eventValue;
				onChange( parsedValue );
			};
			return (
				<input
					type="text" value={ stringifiedValue || '' }
					onChange={ onChangeObject }
					{ ...props }
				/>
			);
		default:
			const onChangeEvent = event => onChange( event.target.value );
			return (
				<input
					type="text" value={ value || '' }
					onChange={ onChangeEvent }
					{ ...props }
				/>
			);
	}
}
