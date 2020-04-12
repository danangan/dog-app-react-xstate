import {assign, createMachine} from "xstate";

const fetchBreedList = () => {
    return fetch('https://dog.ceo/api/breeds/list/all');
};

const fetchDogBasedOnBreed = (breed: string) => {
    return fetch(`https://dog.ceo/api/breed/${breed}/images/random`);
};

const fetchRandomDogBreed = () => {
    return fetch('https://dog.ceo/api/breeds/image/random');
};

const dogMachine = createMachine(
    {
        initial: 'loadingBreedList',
        context: {
            filter: null,
            dogBreeds : {},
            dogImage: null,
        },
        states: {
            loadingBreedList: {
                invoke: {
                    id: 'fetchBreedList',
                    src: () => fetchBreedList().then(res => res.json()),
                    onDone: {
                        target: 'idle',
                        actions: ['assignDogBreeds']
                    },
                    onError: {
                        target: 'error',
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
                    id: 'fethDogImage',
                    src: (context) => {
                        if (context.filter !== null) {
                            return fetchDogBasedOnBreed(context.filter).then(res => res.json())
                        } else {
                            return fetchRandomDogBreed().then(res => res.json())
                        }
                    },
                    onDone: {
                        target: 'idle',
                        actions: ['assignDogImage']
                    },
                    onError: {
                        target: 'error',
                    }
                }
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
