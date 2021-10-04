import React from 'react'
import AppView from "../components/AppView"
import { reducer } from '../reducers/Reducer'
import { getInitialState } from "../reducers/InitialState";
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, Theme, StyledEngineProvider } from '@mui/material/styles';
import { theme, themeDark } from '../theme';
import "typeface-roboto";
import "fontsource-public-sans";
import { resetConfig } from '../lib/LocalStorage';


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

window.addEventListener('keypress', function(e) {
  if(e.keyCode === 32 && e.target === document.body) {
    e.preventDefault();
  }
  if (e.altKey && e.ctrlKey && e.key === "r") {
    resetConfig()
    console.log("config reset")
  }
});

function App(props: {}) {
  const [state, dispatch] = React.useReducer( reducer, getInitialState() )

  const appTheme = state.config.theme.getActiveName() === "bright" ? theme : themeDark
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={appTheme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <AppView state={state} dispatch={dispatch} />
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
export default App