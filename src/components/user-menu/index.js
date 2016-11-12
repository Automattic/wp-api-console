import React from 'react';
import { connect } from 'react-redux';

import './style.css';

import { getSelectedApi } from '../../state/ui/selectors';
import { isReady, isLoggedin, getUser } from '../../state/security/selectors';
import { login, logout } from '../../state/security/actions';

const UserMenu = ( { apiName, isReady, isLoggedin, login, logout, user } ) => {
	if ( ! isReady ) {
		return (
			<div className="user-menu loading">
				<div className="throbber"><div /></div>
			</div>
		);
	}

	if ( ! isLoggedin ) {
		const loginCallback = () => login( apiName );
		return (
			<div className="user-menu" onClick={ loginCallback }>
				<span className="label" />
				<span className="extra">Sign In</span>
			</div>
		);
	}

	const logoutCallback = () => logout( apiName );
	return (
		<div className="user-menu authorized" onClick={ logoutCallback }>
			<span className="label" />
			<span className="extra">Sign Out</span>
			<span className="img">
				<img alt="Avatar" src={ user.avatarURL } />
			</span>
		</div>
	);
};

export default connect(
	state => {
		const apiName = getSelectedApi( state );
		return {
			isReady: isReady( state, apiName ),
			isLoggedin: isLoggedin( state, apiName ),
			user: getUser( state, apiName ),
			apiName,
		};
	},
	{ login, logout }
)( UserMenu );
