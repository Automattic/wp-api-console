import React from 'react';

import './style.css';

const CloseButton = ( { onClick } ) => (
	<div className="close-button">
		<a onClick={ onClick } />
	</div>
);

export default CloseButton;
