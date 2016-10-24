import React from 'react';

import './style.css';

const RequestHeader = ({ request: { path, method, apiName, version } }) => {
  return (
    <div className="request-header">
      <code className="apiName">{ apiName }</code>
      <code className="method">{ method }</code>
      <code className="path">{ `${version}${path}` }</code>
    </div>
  );
};

export default RequestHeader;
