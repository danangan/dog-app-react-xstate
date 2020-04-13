import React from 'react';
import { useMachine } from '@xstate/react';
import dogMachine from "./dogMachine";
import {GenericLoader} from './GenericLoader';

export default function App() {
  const [state, send] = useMachine(dogMachine, {devTools: true});

  let content;
  switch (true) {
    case state.matches('loadingBreedList'):
      content = (
        <div className>
          <span>Preparing your dog breed list...</span>
          <AppLoader />
        </div>
      );
      break;
    case state.matches('idle'):
      content = <>
        <div className="flex flex-row mb-2">
          <BreedOption
            className="flex-1 outline-none border px-2 mr-1"
            value={state.context.filter} breeds={state.context.dogBreeds}
            onChange={e => send('UPDATE_FILTER', {data: e.target.value})}
          />
          <button className="border bg-indigo-700 p-3 text-white rounded" onClick={send.bind(null, ['FETCH_DOG'])}>Get the dog!</button>
        </div>
        {
          state.context.dogImage &&
          <img className="width-100 rounded" alt="dog image" src={state.context.dogImage}/>
        }
      </>;
      break;
    case state.matches('loading'):
      content = <AppLoader />;
      break;
    default:
      content = <div>default content</div>;
      break;
  }

  return (
    <AppContainer>
      {content}
    </AppContainer>
  )
}


function AppLoader() {
  return <GenericLoader className="border-8 border-indigo-500"/>
}

function AppContainer(props) {
  return (
    <div className="h-screen flex flex-row justify-center items-center">
      <div style={{width: "420px", height: "500px"}} className="border shadow p-4 rounded-lg">
        <h1 className="font-mono font-extrabold text-3xl">Dog App</h1>
        <h2 className="text-gray-700 text-light mb-4">Made with React + XState</h2>
        {props.children}
      </div>
    </div>
  );
}

function BreedOption({breeds, onChange, value, ...restProps}) {
    const mainBreeds = Object.keys(breeds);
    return (
        <select className="border" onChange={onChange} value={value} {...restProps}>
            <option value="">Random</option>
            {
                mainBreeds.map(breed => (
                    <option value={breed} key={breed}>{breed}</option>
                ))
            }
        </select>
    )
}
