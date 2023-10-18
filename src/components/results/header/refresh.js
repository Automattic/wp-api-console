import React from 'react';
import { connect } from 'react-redux';

import { refresh } from '../../../state/results/actions';

const Refresh = ( { refreshResult } ) => (
	<span
		onClick={ refreshResult }
		className="refresh"
		title="Refresh"
	>
		<i className="refresh-icon">↺</i>
	</span> );

const mapDispatchToProps = ( dispatch, { id } ) => {
	return { refreshResult: () => dispatch( refresh( id ) ) };
};

export default connect( undefined, mapDispatchToProps )( Refresh );
