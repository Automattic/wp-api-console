import React from 'react';

import './style.css';

import ApiSelector from '../api-selector';
import VersionSelector from '../version-selector';
import LookupContainer from '../lookup-container';
import Submit from '../submit';

const Header = () => {
  return (
    <div id="header">
      <ApiSelector />
      <VersionSelector />
      <LookupContainer />
      <Submit />
    </div>
  );
}

export default Header;
