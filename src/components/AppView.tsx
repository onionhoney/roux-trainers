import React from 'react'
import { AppState, Mode, Action } from "../Types";

import { Box, Typography,Button, makeStyles } from '@material-ui/core';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import { Grid, Container } from '@material-ui/core';

import CmllTrainerView from './CmllTrainerView';
import BlockTrainerView from './BlockTrainerView';
import PanoramaView from './PanoramaView';


//import 'typeface-roboto';

import FavListView from './FavListView';
import TopBarView from './TopBarView';
import AnalyzerView from './AnalyzerView';
import TrackerView from './TrackerView';


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
      {value === index && <Box p={0}>{children}</Box>}
    </Typography>
  );
}
const useStyles = makeStyles(theme => ({
  page: {
    backgroundColor: theme.palette.background.default
  },
  container: {
    display: "flex"
  },
  icon: {
    minWidth: 0
  },
  root: {
    display: "flex"
  },
  bar: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.background.paper,
    //borderRadius: "5px"
  },
  select: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.background.paper,
    borderRadius: 4,
    border: "1px solid " + theme.palette.background.default,
  }
}))


const modes : Mode[] = ["analyzer", "tracking", "fbdr", "fs", "fb", "ss", "fbss", "cmll", "4c", "eopair"]

function _getInitialHashLocation() {
  const default_idx = 2
  if (window.location.hash) {
    let idx = (modes as string[]).indexOf(window.location.hash.slice(1))
    if (idx === -1) {
      window.location.hash = "";
      return default_idx;
    } else {
      return idx;
    }
  } else {
    return default_idx
  }
}


// TODO: Write getter and setter for config items, and also write handlers that map to setters
function AppView(props: { state: AppState, dispatch: React.Dispatch<Action> } ) {
  //const [locations, setLocations] = React.useState([])
  let { state, dispatch } = props
  let classes = useStyles()

  const handleChange = React.useCallback( (newValue:number) => {
    if (newValue < modes.length) {
      setValue(newValue)
      let mode = modes[newValue]
      dispatch({type: "mode", content: mode})
    }
  }, [dispatch])

  const [ open, setOpen ] = React.useState(false)

  const [value, setValue] = React.useState(_getInitialHashLocation());
  React.useEffect( () => {
    dispatch({type: "mode", content: modes[_getInitialHashLocation()]})
  }, [])

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
  const toggleFav = () => {
    setFav(!showFav)
  }

  const [ showFav, setFav ] = React.useState(false)

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

        --onionhoney(Zhouheng Sun)
        </Typography>

      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={handleInfoClose}>
          Got it!
        </Button>
      </DialogActions>
      </Dialog>

      <TopBarView onChange={handleChange} value={value}
        handleInfoOpen={handleInfoOpen} toggleBright={toggleBright} toggleFav={toggleFav}
      />


      <Box paddingY={2}>
      <Container maxWidth={showFav ? "lg" : "md" }>

      {
      value === -1?
      (
      <Grid container className={classes.container} spacing={3}>
        <Grid item md={12} sm={12} xs={12}>
        <TabPanel value={value} index={4} className={classes.page}>
          <PanoramaView {...{state, dispatch}} />
        </TabPanel>
        </Grid>
      </Grid>
      )
      :
      (
      <Grid container className={classes.container} spacing={3}>
        <Grid item hidden={!showFav} md={4} sm={4} xs={12} >
        <FavListView {...{state, dispatch}} />
        </Grid>

        <Grid item md={showFav ? 8 : 12} sm={showFav ? 8 : 12} xs={12}>
        <TabPanel value={value} index={0} className={classes.page}>
          <AnalyzerView {...{state, dispatch}} />
        </TabPanel>
        <TabPanel value={value} index={1} className={classes.page}>
          <TrackerView {...{state, dispatch}} />
        </TabPanel>
        <TabPanel value={value} index={2} className={classes.page}>
          <BlockTrainerView {...{state, dispatch}} />
        </TabPanel>
        <TabPanel value={value} index={3} className={classes.page}>
          <BlockTrainerView {...{state, dispatch}} />
        </TabPanel>
        <TabPanel value={value} index={4} className={classes.page}>
          <BlockTrainerView {...{state, dispatch}} />
        </TabPanel>
        <TabPanel value={value} index={5} className={classes.page}>
          <BlockTrainerView {...{state, dispatch}} />
        </TabPanel>
        <TabPanel value={value} index={6} className={classes.page}>
          <BlockTrainerView {...{state, dispatch}} />
        </TabPanel>
        <TabPanel value={value} index={7} className={classes.page}>
          <CmllTrainerView {...{state, dispatch}} />
        </TabPanel>
        <TabPanel value={value} index={8} className={classes.page}>
          <BlockTrainerView {...{state, dispatch}} />
        </TabPanel>
        <TabPanel value={value} index={9} className={classes.page}>
          <BlockTrainerView {...{state, dispatch}} />
        </TabPanel>
        </Grid>
      </Grid>
      )
      }
      </Container></Box>



    </main>
  )
}
export default AppView