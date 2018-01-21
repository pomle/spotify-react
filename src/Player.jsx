import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createPlayer } from '@pomle/spotify-web-sdk';
import { handleMessage } from '@pomle/spotify-redux';

import { createPoller } from './poller.js';

export class Player extends PureComponent {
  static propTypes = {
    name: PropTypes.string,
    token: PropTypes.string.isRequired,
    handleMessage: PropTypes.func.isRequired,
  };

  async componentWillMount() {
    const {token, name, handleMessage} = this.props;

    this.player = await createPlayer(token, {
      name,
    });

    this.player.on('ready', message => {
      handleMessage('ready', message);
    });

    this.player.on('player_state_changed', message => {
      if (!message) {
        console.warn('player_state_changed message was empty', message);
        return;
      }

      handleMessage('state', message);
    });

    this.poller = createPoller(this.player, context => {
      handleMessage('state', context);
    });

    this.player.connect();
  }

  componentWillUnmount() {
    if (this.poller) {
      this.poller.destroy();
    }
    if (this.player) {
      this.player.disconnect();
    }
  }

  render() {
    return this.props.children;
  }
}

export default connect(state => {
  return {
    token: state.session.token,
  }
}, {
  handleMessage,
})(Player);
