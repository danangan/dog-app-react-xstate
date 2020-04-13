import {assign, createMachine} from "xstate";

const fetchBreedList = () => {
    return fetch('https://dog.ceo/api/breeds/list/all');
};

const fetchRandomDogBreed = () => fetch('https://dog.ceo/api/breeds/image/random');

const fetchDogBasedOnBreed = (breed: string) => fetch(`https://dog.ceo/api/breed/${breed}/images/random`)

const waitForXmSPromise = (mS) => new Promise(resolve => setTimeout(resolve, mS));

const waitForOneSecond = waitForXmSPromise.bind(null, 1000);

const waitForMinimumCompletionOfOneSecond = (promise) => Promise.all([promise, waitForOneSecond()]).then(res => res[0]);

const fetchDogBasedOnBreedButWithMinimumResolveOfOneSecond = (filter: string) => waitForMinimumCompletionOfOneSecond(fetchDogBasedOnBreed(filter));

const dogMachine = createMachine(
    {
        initial: 'loadingBreedList',
        context: {
            filter: "",
            dogBreeds : null,
            dogImage: null,
        },
        states: {
            loadingBreedList: {
                invoke: {
                    id: 'fetchBreedList',
                    src: () => fetchBreedList().then(res => res.json()),
                    onDone: {
                        actions: ['assignDogBreeds']
                    },
                    onError: {
                        target: 'error',
                    }
                },
                after: {
                  1000: {
                    target: 'idle',
                    cond: (context) => context.dogBreeds !== null
                  }
                }
            },
            idle: {
                on: {
                    FETCH_DOG: 'loading',
                    UPDATE_FILTER: {
                        actions: ['updateFilter']
                    }
                }
            },
            loading: {
                invoke: {
                    id: 'fetchDogImage',
                    src: (context) => {
                        if (context.filter) {
                            return fetchDogBasedOnBreedButWithMinimumResolveOfOneSecond(context.filter).then(res => res.json())
                        } else {
                            return fetchRandomDogBreed().then(res => res.json())
                        }
                    },
                    onDone: {
                        actions: ['assignDogImage'],
                        target: 'idle'
                    },
                    onError: {
                        target: 'error',
                    },
                },
            },
            error: {
                on: {
                    RETRY: 'loading',
                }
            }
        },
    }, {
        actions: {
            assignDogBreeds: assign((context, event: any) => ({
                dogBreeds: event.data.message
            })),
            assignDogImage: assign((context, event: any) => ({
                dogImage: event.data.message
            })),
            updateFilter: assign((context, event: any) => {
                return {
                    filter: event.data
                }
            })
        },
    });

export default dogMachine;
