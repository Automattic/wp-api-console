import React, { Component } from 'react';
import AutosizeInput from 'react-input-autosize';

import './style.css';

import ParamTooltip from '../param-tooltip';

class UrlPart extends Component {
	bindInput = ref => {
		this.input = ref;
	}

	focus = () => {
		this.input.focus();
	};

	blur = () => {
		this.input.blur();
	};

	render() {
		const { parameter = false, autosize = false, name = '', value, onSubmit, ...remainingProps } = this.props;

		const onKeyPress = event => {
			if ( event.key === 'Enter' ) {
				onSubmit();
			}
		};

		if ( autosize ) {

			return ( <div className="url-part">
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
			</div> );
		}

		return (
			<input
				value={ value } className="url-part"
				onKeyPress={ onKeyPress }
				ref={ this.bindInput }
				{ ...remainingProps }
			/>
		);
	}
}

export default UrlPart;
