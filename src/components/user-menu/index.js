import React from 'react';
import { connect } from 'react-redux';

import './style.css';

import { isReady, isLoggedin, getUser } from '../../state/security/selectors';
import { login, logout } from '../../state/security/actions';

const UserMenu = ({ isReady, isLoggedin, login, logout, user }) => {
  if (! isReady) {
    return (
      <div className="user-menu loading">
        <div className="throbber"></div>
      </div>
    );
  }

  if (!isLoggedin) {

    return (
      <div className="user-menu" onClick={ login }>
        <span className="label"></span>
        <span className="extra">Sign In</span>
      </div>
    );
  }

  return (
    <div className="user-menu authorized" onClick={ logout }>
      <span className="label"></span>
      <span className="extra">Sign Out</span>
      <span className="img">
        <img alt="Avatar" src={ user.avatar_URL } />
      </span>
    </div>
  );
}

export default connect(
  state => {
    return {
      isReady: isReady(state),
      isLoggedin: isLoggedin(state),
      user: getUser(state)
    };
  },
  { login, logout }
)(UserMenu);
