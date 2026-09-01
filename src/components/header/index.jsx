import './style.css';

import ApiSelector from '../api-selector';
import UserMenu from '../user-menu';
import VersionSelector from '../version-selector';
import LookupContainer from '../lookup-container';
import RequestConfigActions from '../request-config-actions';
import Submit from '../submit';

const Header = () => (
	<div id="header">
		<ApiSelector />
		<VersionSelector />
		<LookupContainer />
		<Submit />
		<RequestConfigActions />
		<UserMenu />
	</div>
);
export default Header;
