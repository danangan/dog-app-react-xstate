import {assign, createMachine} from "xstate";

const fetchBreedList = () => {
    return fetch('https://dog.ceo/api/breeds/list/all');
};

const fetchRandomDogBreed = () => fetch('https://dog.ceo/api/breeds/image/random');

const fetchDogBasedOnBreed = (breed: string) => fetch(`https://dog.ceo/api/breed/${breed}/images/random`)

const waitForXmSPromise = (mS) => new Promise(resolve => setTimeout(resolve, mS));

const waitForOneSecond = waitForXmSPromise.bind(null, 1000);

const waitForMinimumCompletionOfOneSecond = (promise) => Promise.all([promise, waitForOneSecond()]).then(res => res[0]);

const dogMachine = createMachine(
  {
      id: 'dogApp',
        initial: 'loading',
        context: {
            filter: "",
            dogBreeds : null,
            dogImage: null,
        },
        states: {
            idle: {
                on: {
                    FETCH_DOG: 'loading.image',
                    UPDATE_FILTER: {
                        actions: ['updateFilter']
                    }
                }
            },
            loading: {
                initial: 'breeds',
                states: {
                  breeds: {
                    meta: {
                      message: 'Fetching breeds list...'
                    },
                    invoke: {
                      src: () => fetchBreedList().then(res => res.json()),
                      onDone: {
                        actions: ['assignDogBreeds']
                      },
                      onError: {
                        target: '#dogApp.error',
                      }
                    },
                    after: {
                      1000: {
                        target: '#dogApp.idle',
                        cond: (context) => context.dogBreeds !== null
                      }
                    }
                  },
                  image: {
                    meta: {
                      message: 'Fetching the dog image...'
                    },
                    invoke: {
                      id: 'fetchDogImage',
                      src: (context) => {
                        if (context.filter) {
                          return waitForMinimumCompletionOfOneSecond(fetchDogBasedOnBreed(context.filter)).then(res => res.json())
                        } else {
                          return waitForMinimumCompletionOfOneSecond(fetchRandomDogBreed()).then(res => res.json())
                        }
                      },
                      onDone: {
                        actions: ['assignDogImage'],
                        target: '#dogApp.idle',
                      },
                      onError: {
                        target: '#dogApp.error',
                        internal: false,
                      },
                    },
                  }
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
            assignDogBreeds: assign((context, event: any) => {
              return {
                dogBreeds: event.data.message
              }
            }),
            assignDogImage: assign((context, event: any) => {
              return {
                dogImage: event.data.message
              }
            }),
            updateFilter: assign((context, event: any) => {
                return {
                    filter: event.data
                }
            })
        },
    });

export default dogMachine;
