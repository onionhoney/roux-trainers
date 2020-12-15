import { red } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

// A custom theme for this app
const theme = createMuiTheme({
  name: "bright",
  palette: {
    primary: {
      main: '#556cd6',// '#e0e8ff'//b0c4ee', //
    },
    secondary: {
      main: '#d32f2f',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#eeeeef',
      paper: '#fff'
    },
    text: {
      primary: '#000',
      secondary: '#888',
      hint: '#556cd6'
    }
  },
  /*
  typography: {
    "fontFamily": `"Public Sans", "Roboto", "Helvetica", "Arial", sans-serif`,
    "fontSize": 14,
    "fontWeightLight": 400,
    "fontWeightRegular": 500,
    "fontWeightMedium": 600
  }
  */

});
const themeDark = createMuiTheme({
  name: "dark",
  palette: {
    primary: {
      main: '#9FA4C2', // '#757575',
    },
    secondary: {
      main: '#ffffff', //f55057',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#121212',
      paper: '#252525' //#424242'
    },
    text: {
      primary: '#fff',
      secondary: '#ddd',
      hint: '#eee'
    }
  },
  overrides: {
    // Style sheet name ⚛️
    MuiDivider: {
      // Name of the rule
      // Some CSS
      root: {
        backgroundColor: 'rgba(255, 255 ,255, 0.3)',
      }
    },
  }

});

export { theme, themeDark };