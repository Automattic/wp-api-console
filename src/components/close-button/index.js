import React from 'react';

import './style.css';

const CloseButton = ( { onClick } ) => (
	<button
		className="close-button"
		onClick={ onClick }
	/>
);

export default CloseButton;
