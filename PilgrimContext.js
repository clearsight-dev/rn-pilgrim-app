import {createContext} from 'react'

export const PilgrimContext = createContext({
  pilgrimGlobals: {}, 
  setPilgrimGlobals: () => {}
});