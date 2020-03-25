import { red } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

// A custom theme for this app
const theme = createMuiTheme({
  name: "bright",
  palette: {
    primary: {
      main: '#556cd6',
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

});
const themeDark = createMuiTheme({
  name: "dark",
  palette: {
    primary: {
      main: '#757575',
    },
    secondary: {
      main: '#f55057',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#303030',
      paper: '#424242'
    },
    text: {
      primary: '#fff',
      secondary: '#ddd',
      hint: '#ddd'
    }
  },

});

export { theme, themeDark };