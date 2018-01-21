import { connect as reduxConnect } from 'react-redux';

export function connect(mappers, mapDispatchToProps) {
    function mapStateToProps(state, props) {
        return mappers.reduce((mapStateToProps, mapper) => {
            return Object.assign(mapStateToProps, mapper(state, props));
        }, {});
    }

    return function connect(component) {
        return reduxConnect(mapStateToProps, mapDispatchToProps)(component);
    };
}

export function withPlayingTrack(state) {
    const track = state.player.currentTrack;
    const trackId = track && track.get('id');
    return {
        track,
        analysis: state.track.analysis.get(trackId),
        features: state.track.feature.get(trackId),
        context: state.player.context,
    };
}
