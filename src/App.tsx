import React from 'react';
import { createMachine } from 'xstate';

const machine = createMachine({
    initial: 'idle',
    context: {
        filter: null,
        dogBreeds : [],
        dogImage: null,
    },
    states: {
        idle: {
            on: {
                FETCH: 'loading'
            }
        },
        loading: {
            on: {
                SUCCESS: 'idle',
                ERROR: 'error'
            }
        },
        error: {
            on: {
                RETRY: 'loading',
            }
        }
    }
});

export default function App() {

    return <div></div>
}
