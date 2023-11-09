import React from 'react';
import * as PropTypes from 'prop-types';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';

const ParamInput = ( { onChange, type, value, ...props } ) => {
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
			const stringifiedValue = 'string' === typeof value ? value : JSON.stringify( value );
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
};

ParamInput.propTypes = {
	onChange: PropTypes.func.isRequired,
	type: PropTypes.string,
	value: PropTypes.any,
};

export default ParamInput;
