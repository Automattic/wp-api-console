import React, { Component } from 'react';
import AutosizeInput from 'react-input-autosize';

import './style.css';

import ParamTooltip from '../param-tooltip';

class UrlPart extends Component {
	bindInput = ref => {
		this.input = ref;
	}

	focus = ( position = 0 ) => {
		// This is a Cross Browser cursor positionning found on StackOverflow
		if ( this.input.createTextRange ) {
			const range = this.input.createTextRange();
			range.move( 'character', position );
			range.select();
		} else if ( this.input.selectionStart ) {
			this.input.focus();
			this.input.setSelectionRange( position, position );
		} else {
			this.input.focus();
		}
	};

	blur = () => {
		this.input.blur();
	};

	render() {
		const { className = 'url-part', parameter = false, autosize = false, name = '', value, onSubmit, ...remainingProps } = this.props;

		const onKeyPress = event => {
			if ( event.key === 'Enter' ) {
				onSubmit();
			}
		};

		if ( autosize ) {
			return (
				<div className={ className }>
					<AutosizeInput
						value={ value }
						placeholder={ name }
						inputStyle={ { fontSize: 14 } }
						data-tip data-for={ `url-part-${ name }` }
						onKeyPress={ onKeyPress }
						ref={ this.bindInput }
						{ ...remainingProps }
					/>
					{ parameter && <ParamTooltip parameter={ parameter } id={ `url-part-${ name }` } name={ name } /> }
				</div>
			);
		}

		return (
			<input
				value={ value } className={ className }
				onKeyPress={ onKeyPress }
				ref={ this.bindInput }
				{ ...remainingProps }
			/>
		);
	}
}

export default UrlPart;
