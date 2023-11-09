import React from 'react';
import * as PropTypes from 'prop-types';

import './style.css';

const CloseButton = ( { onClick } ) => (
	<div className="close-button">
		<a onClick={ onClick } />
	</div>
);

CloseButton.propTypes = {
	onClick: PropTypes.func.isRequired,
};

export default CloseButton;
