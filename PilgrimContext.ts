import {createContext, Dispatch, SetStateAction} from 'react'

export const PilgrimContext = createContext<{
  pilgrimGlobals: any; 
  setPilgrimGlobals: Dispatch<SetStateAction<{ homePageScrolledDown: boolean; }>>|null;
}>({
  pilgrimGlobals: {}, 
  setPilgrimGlobals: null
});