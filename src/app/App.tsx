import React from 'react'
import { defaultKeyMapping } from "../lib/Defs";
import AppView from "../components/AppView"
import { reducer, getInitialState } from '../reducers/Reducer'
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';
import { theme, themeDark } from '../theme';
import { getActiveName } from '../lib/Selector';

window.addEventListener('keypress', function(e) {
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

  const appTheme = getActiveName(state.config.theme) === "bright" ? theme : themeDark
  return (
    <ThemeProvider theme={appTheme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <AppView state={state} dispatch={dispatch} />
    </ThemeProvider>
  )
}
export default App