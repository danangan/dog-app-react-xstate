import React from 'react';
import { useMachine } from '@xstate/react';
import dogMachine from "./dogMachine";

export default function App() {
    const [state, send] = useMachine(dogMachine, {devTools: true});

    let content;
    switch (true) {
        case state.matches('loadingBreedList'):
            content = <div>Loading your dog breed list</div>;
            break;
        case state.matches('idle'):
            content = <div>
                <BreedOption breeds={state.context.dogBreeds} onChange={e => send('UPDATE_FILTER', {data: e.target.value})}/>
                <button onClick={() => send('FETCH_DOG')}>Get the dog!</button>
                <img src={state.context.dogImage}/>
            </div>;
            break;
        case state.matches('loading'):
            content = <div>Loading the dog</div>;
            break;
        default:
            content = <div>default content</div>;
            break;
    }

    return <div>
        <h1>Dog App</h1>
        {content}
    </div>
}

function BreedOption({breeds, onChange}) {
    const mainBreeds = Object.keys(breeds);
    return (
        <select onChange={onChange}>
            {
                mainBreeds.map(breed => (
                    <option value={breed} key={breed}>{breed}</option>
                ))
            }
        </select>
    )
}
