import React from 'react'
import { AppState, Mode, Action } from "../Types";

import { Box, AppBar, Typography,Button,  Tabs, Tab, makeStyles } from '@material-ui/core';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';

import CmllTrainerView from './CmllTrainerView';
import BlockTrainerView from './BlockTrainerView';

import IconButton from '@material-ui/core/IconButton';
import Brightness6Icon from '@material-ui/icons/Brightness6';
import InfoIcon from '@material-ui/icons/Info';


interface TabPanelProps {
  value: number,
  index: number,
  children: any,
  [key: string]: any
}
function TabPanel(props: TabPanelProps ) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </Typography>
  );
}
const useStyles = makeStyles(theme => ({
  page: {
    backgroundColor: theme.palette.background.default
  },
  icon: {
    minWidth: 0
  }
}))

// TODO: Write getter and setter for config items, and also write handlers that map to setters
function AppView(props: { state: AppState, dispatch: React.Dispatch<Action> } ) {
  //const [locations, setLocations] = React.useState([])
  let { state, dispatch } = props
  let classes = useStyles()

  const handleChange = React.useCallback( (_:any, newValue:number) => {
    const modes : Mode[] = ["fbdr", "ss", "fb", "cmll"]
    if (newValue < modes.length) {
      setValue(newValue)
      let mode = modes[newValue]
      dispatch({type: "mode", content: mode})
    }
  }, [dispatch])

  const [ open, setOpen ] = React.useState(false)
  const [value, setValue] = React.useState(0);

  const handleInfoOpen = () => { setOpen(true) }
  const handleInfoClose = () => { setOpen(false) }

  const toggleBright = () => {
    const theme_flag = [...state.config.theme.flags]
    theme_flag[0] = 1 - theme_flag[0]
    theme_flag[1] = 1 - theme_flag[1]
    dispatch({ type: "config", content: {
      theme: {
        ...state.config.theme,
        flags: theme_flag
    }}})
  }

  return (
    <main>
      <Dialog open={open} onClose={handleInfoClose} >
      <DialogTitle>About</DialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom style={{whiteSpace: 'pre-line', fontSize: '1.3rem'}}>
          Welcome to my awesome roux block trainer.
        </Typography>
        <br/>

        <Typography gutterBottom style={{whiteSpace: 'pre-line'}}>

        A bunch of shortcuts: <br/>
        - Space for the next scramble. <br/>
        - Enter to reset the virtual cube to current scramble. <br/>
        - Cstimer style virtual cube control. <br/>

        <br/>
        </Typography>

        {/* <Typography gutterBottom style={{whiteSpace: 'pre-line'}} variant="subtitle2">
        Currently supporting: FB+DR, SS, CMLL
        </Typography> */}

        <Typography gutterBottom style={{whiteSpace: 'pre-line'}} variant="body2">

        Feature requests are most definitely welcome. :)
        </Typography>

        <Typography gutterBottom variant="overline">

        --onionhoney
        </Typography>

      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={handleInfoClose}>
          Got it!
        </Button>
      </DialogActions>
      </Dialog>

      <AppBar color="primary" position="static">
        <Tabs value={value} onChange={handleChange} scrollButtons="on" variant="scrollable" indicatorColor="secondary" >
          <Tab onFocus={e => e.target.blur() } label="FBDR Trainer" id='tab0' />
          <Tab onFocus={e => e.target.blur() } label="SSquare Trainer" id='tab1' />
          <Tab onFocus={e => e.target.blur() } label="Tough FB Trainer" id='tab2' />
          <Tab onFocus={e => e.target.blur() } label="CMLL Trainer" id='tab3'/>
          <div style={{ flexGrow: 1 }}/>

          <Tab id='icon0' onClick={toggleBright} icon={ <Brightness6Icon /> } className={classes.icon} />
          <Tab id='icon1' onClick={handleInfoOpen} icon={ <InfoIcon /> } className={classes.icon} />

        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0} className={classes.page}>
        <BlockTrainerView {...{state, dispatch}} />
      </TabPanel>
      <TabPanel value={value} index={1} className={classes.page}>
        <BlockTrainerView {...{state, dispatch}} />
      </TabPanel>
      <TabPanel value={value} index={2} className={classes.page}>
        <BlockTrainerView {...{state, dispatch}} />
      </TabPanel>
      <TabPanel value={value} index={3} className={classes.page}>
        <CmllTrainerView {...{state, dispatch}} />
      </TabPanel>

    </main>
  )
}
export default AppView