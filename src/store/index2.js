import { configureStore } from '@reduxjs/toolkit';

import { apiSlice } from "@/store/Slices/apiSlice";
import { authSlice } from "./Slices/authSlice";
import { headerSlice } from "./Slices/headerSlice";
import { useMemo } from 'react'
import { setupListeners } from '@reduxjs/toolkit/dist/query';

let store

const initialState = {}

function initStore(preloadedState = initialState) {
  return configureStore({
    reducer: {
        auth: authSlice.reducer,
        headData: headerSlice.reducer,
      // Add the generated reducer as a specific top-level slice
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    preloadedState,
    // Adding the api middleware enables caching, invalidation, polling,
    // and other useful features of `rtk-query`.
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
  });
}

export const initializeStore = (preloadedState) => {
  let _store = store ?? initStore(preloadedState)

  // After navigating to a page with an initial Redux state, merge that state
  // with the current state in the store, and create a new store
  if (preloadedState && store) {
    _store = initStore({
      ...store.getState(),
      ...preloadedState,
    })
    // Reset the current store
    store = undefined
  }

  // For SSG and SSR always create a new store
  if (typeof window === 'undefined') return _store
  // Create the store once in the client
  if (!store) store = _store

  return _store
}

export function useStore(initialState) {
  const store = useMemo(() => initializeStore(initialState), [initialState])
  setupListeners(store.dispatch);
  return store
}

export function removeUndefined(state) {
  if (typeof state === 'undefined') return null
  if (Array.isArray(state)) return state.map(removeUndefined)
  if (typeof state === 'object' && state !== null) {
    return Object.entries(state).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: removeUndefined(value)
      }
    }, {})
  }

  return state
}