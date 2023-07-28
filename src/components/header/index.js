import React from 'react';

import './style.css';

import ApiSelector from '../api-selector';
import UserMenu from '../user-menu';
import VersionSelector from '../version-selector';
import LookupContainer from '../lookup-container';
import Submit from '../submit';
import ShareRequest from '../share-request';

const Header = () =>
	(
		<div id="header">
			<ApiSelector />
			<VersionSelector />
			<LookupContainer />
			<Submit />
			<ShareRequest />
			<UserMenu />
		</div>
	)
;

export default Header;
