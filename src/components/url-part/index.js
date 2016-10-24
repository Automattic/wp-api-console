import React from 'react';

import './style.css';

const UrlPart = props => {
  const { defaultValue = '', value, ...remainingProps } = props;

  return (
    <input value={value} className="url-part" placeholder={ defaultValue } { ...remainingProps } />
  );
}

export default UrlPart;
