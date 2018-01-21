import { PureComponent } from 'react';
import { fromJS } from 'immutable';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createPlayer } from '@pomle/spotify-web-sdk';
import { setAnalysis, setFeature, setAlbumPalette, handleMessage } from '@pomle/spotify-redux';

import { createPoller } from './poller';
import { onChange } from './util';

export class Player extends PureComponent {
  static propTypes = {
    name: PropTypes.string,
    session: PropTypes.object.isRequired,
    handleMessage: PropTypes.func.isRequired,
  };

  componentWillMount() {
    const {session: {token}, name, handleMessage} = this.props;

    createPlayer(token, {name})
    .then(player => this.setupPlayer(player));
  }

  componentWillUnmount() {
    if (this.poller) {
      this.poller.destroy();
    }
    if (this.player) {
      this.player.disconnect();
    }
  }

  setupPlayer(player) {
    this.plyaer = player;

    this.player.on('ready', message => {
      handleMessage('ready', message);
    });

    this.player.on('player_state_changed', message => {
      if (!message) {
        console.warn('player_state_changed message was empty', message);
        return;
      }

      this.onContext(fromJS(message));

      handleMessage('state', message);
    });

    this.poller = createPoller(this.player, context => {
      handleMessage('state', context);
    });

    this.player.connect();
  }

  onContext(context) {
    this.onTrackChange(context.getIn(['track_window', 'current_track', 'id']));
    this.onAlbumChange(context.getIn(['track_window', 'current_track', 'album', 'uri']));
  }

  onTrackChange = onChange(trackId => {
    const {session, setAnalysis, setFeature} = this.props;
    const api = session.trackAPI;

    api.getAudioFeatures(trackId)
    .then(data => setFeature(trackId, data))

    api.getAudioAnalysis(trackId)
    .then(data => setAnalysis(trackId, data));
  });

  onAlbumChange = onChange(albumURI => {
    const {session, setAlbumPalette} = this.props;
    const api = session.trackAPI;
    const albumId = albumURI.split(':')[2];
    api.request(`https://vibrant.pomle.com/v1/album/${albumId}`)
    .then(palette => setAlbumPalette(albumId, palette));
  });

  render() {
    return this.props.children;
  }
}

export default connect(state => {
  return {
    session: state.session,
  }
}, {
  handleMessage,
  setAlbumPalette,
  setAnalysis,
  setFeature,
})(Player);
