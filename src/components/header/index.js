import React from 'react';

import './style.css';

import ApiSelector from '../api-selector';
import UserMenu from '../user-menu';
import VersionSelector from '../version-selector';
import LookupContainer from '../lookup-container';
import Submit from '../submit';

const Header = () => {
  return (
    <div id="header">
      <UserMenu />
      <ApiSelector />
      <VersionSelector />
      <LookupContainer />
      <Submit />
    </div>
  );
}

export default Header;
