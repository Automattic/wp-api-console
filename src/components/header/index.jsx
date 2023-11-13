import React from 'react';

import './style.css';

import ApiSelector from '../api-selector';
import UserMenu from '../user-menu';
import VersionSelector from '../version-selector';
import LookupContainer from '../lookup-container';
import Share from '../share';
import Submit from '../submit';

const Header = () =>
	(
		<div id="header">
			<ApiSelector />
			<VersionSelector />
			<LookupContainer />
			<Share />
			<Submit />
			<UserMenu />
		</div>
	)
;

export default Header;
