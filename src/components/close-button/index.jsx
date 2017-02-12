import React, { PropTypes } from 'react';

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
