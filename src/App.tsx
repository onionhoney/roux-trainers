import React from 'react'
import { defaultKeyMapping } from "./Defs";
import AppView from "./AppView"
import { reducer, initialState } from './Reducer'


function App(props: {}) {
  const [state, dispatch] = React.useReducer( reducer, initialState )

  // Add event listeners
  React.useEffect(() => {
    function downHandler({ key }: { key : string}) {
      key = key.toUpperCase()
      if (defaultKeyMapping.hasOwnProperty(key)) {
        dispatch({
          type: "key", content: defaultKeyMapping[key] }
        );
      }
    }
    window.addEventListener('keydown', downHandler);
    return () => {
      window.removeEventListener('keydown', downHandler);
    };
  });

  return (
    <AppView state={state} dispatch={dispatch} />
  )
}
export default App