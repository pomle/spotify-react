import React, { Component } from 'react';
import renderer from 'react-test-renderer';
import { createStore, handleMessage, setAnalysis, setFeature } from '@pomle/spotify-redux';

import { connect, withPlayingTrack } from '../connect';
import playerContext from './fixtures/player-context.json';

function fakeStore(state) {
    return {
        getState() {
            return state;
        },
        dispatch() {

        },
        subscribe() {

        },
    };
}

describe('#connect', () => {
    const FAKE_STORE = fakeStore({
        z: 100,
    });

    it("works as standard connect but takes an array", () => {
        const a = 1, b = 2;

        const Comp = connect([
            state => ({z: state.z, a}),
            state => ({x: state.z + 1, b}),
        ])(({a, b, z, x}) => {
            return <div>{a} {b} {z}, {x}</div>;
        });

        expect(renderer.create(<Comp store={FAKE_STORE}/>))
            .toMatchSnapshot();
    });
});

describe('#withPlayingTrack', () => {
    const store = createStore();
    store.dispatch(handleMessage('state', playerContext));
    store.dispatch(setAnalysis('1Nk3rKuQwAgVNqT93pFvAd', {data: 'The analyses'}));
    store.dispatch(setFeature('1Nk3rKuQwAgVNqT93pFvAd', {data: 'The features'}));

    it("maps Spotify state to props", () => {
        const Comp = connect([
            withPlayingTrack
        ])(props => {
            return <div>
                {props.analysis.data}

                {props.features.data}

                {props.track.get('id')}
            </div>;
        });

        expect(renderer.create(<Comp store={store}/>))
            .toMatchSnapshot();
    });
});
