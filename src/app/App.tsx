import React from 'react'
import { defaultKeyMapping } from "../lib/Defs";
import AppView from "../components/AppView"
import { reducer, getInitialState } from '../reducers/Reducer'

window.addEventListener('keypress', function(e) {
  console.log("keypress!", e)
  if(e.keyCode === 32 && e.target === document.body) {
    e.preventDefault();
  }
});

function App(props: {}) {
  const [state, dispatch] = React.useReducer( reducer, getInitialState() )

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