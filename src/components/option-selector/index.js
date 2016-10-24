import React, { Component } from 'react';
import classnames from 'classnames';
import ClickOutside from 'react-click-outside';

import './style.css';

class OptionSelector extends Component {
  state = {
    open: false
  };

  static defaultProps = {
    value: '',
    choices: [],
    isHeader: false
  };

  componentDidMount() {
    const { value, choices, onChange } = this.props;
    if (! value && choices.length) {
      onChange(choices[0]);
    }
  }

  changeValue = (event, value) => {
    event.stopPropagation();
    this.props.onChange(value);
    this.setState({
      open: false
    });
  };

  toggle = () => {
    this.setState({ open: ! this.state.open });
  };

  hide = () => {
    this.setState({ open: false });
  };

  render() {
    const { value, choices, isHeader } = this.props;
    const { open } = this.state;

    return (
      <ClickOutside onClickOutside={ this.hide }>
        <div onClick={ this.toggle } className={ classnames('option-selector', { 'is-header': isHeader }) }>
          <span>{ value }</span>
          { open && <div className="options">
              <ul>
                { choices.map(val =>
                    <li key={ val }
                      onClick={ event => this.changeValue(event, val) }
                      className={ val === value ? 'selected' : ''}>
                      {val}
                    </li>
                  )
                }
              </ul>
            </div>
          }
        </div>
      </ClickOutside>
    );
  }
}

export default OptionSelector;
