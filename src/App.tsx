import React from 'react';
import { useMachine } from '@xstate/react';
import dogMachine from "./dogMachine";
import {GenericLoader} from './GenericLoader';
import {mergeMeta} from "./helper";


export default function App() {
  const [state, send] = useMachine(dogMachine, {devTools: true});

  let content;
  switch (true) {
    case state.matches('loading'):
      const meta: any = mergeMeta(state.meta);
      content = (
        <div className="flex items-center mt-3">
          <AppLoader />
          <span className="ml-3 text-gray-600">{meta.message}</span>
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
        <div className="overflow-hidden rounded" style={{maxHeight: '310px'}}>
          {
            state.context.dogImage &&
            <img className="width-100 max-h-full rounded" alt="dog image" src={state.context.dogImage}/>
          }
        </div>
      </>;
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
      <div style={{height: "500px"}} className="border shadow p-4 rounded-lg w-5/6 sm:w-3/4 md:w-1/2 lg:w-2/5 xl:w-2/6">
        <h1 className="font-mono font-extrabold text-3xl text-indigo-700">Dog App</h1>
        <h2 className="text-gray-600 text-light mb-3">Made with React + XState</h2>
        <div className="bg-indigo-700 h-1 w-full mb-3 rounded" />
        {props.children}
      </div>
    </div>
  );
}

function BreedOption({breeds, onChange, value, ...restProps}) {
    const mainBreeds = Object.keys(breeds);
    return (
        <select className="border" onChange={onChange} value={value} {...restProps}>
            <option value="">random</option>
            {
                mainBreeds.map(breed => (
                    <option value={breed} key={breed}>{breed}</option>
                ))
            }
        </select>
    )
}
