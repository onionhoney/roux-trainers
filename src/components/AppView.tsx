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

import Markdown from 'markdown-to-jsx';


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

const introText = `# Onionhoney's Roux Trainers
- A trainer collection that caters to all your Roux training needs  ❤️
- Inspired by http://cubegrass.appspot.com/, but with everything that it is missing.

## Modes supported
- FB analyzer
    - Solves for all x2y FBs, and suggests the best FB to start with!
    - Other orientations supported too (CN, b/g x2y, etc.)
- FB last slot (+ DR) trainer 
    - \`HIGHLY USEFUL\` if you're learning FB or FB + DR. Get a random scramble, think on your own, and check with our solutions!
    - **Note**: while I try my best, the solver can still miss out on the best overall solution. So please, consult your human fellows when you're unsure, and always be careful with what you choose to learn.
- FS/FB/SS trainer 
    - You can specify by piece positions. It seems these modes are pretty useful in providing new insights into blockbuilding  (for us dumb humans).
- CMLL trainer 
    - Truly random scrambles so you can't tell the cases. You can specify different OCLLs. You can even start with a random SB last pair (to simulate how real recognition works)
- LSE trainers (EOLR, 4c)
    - Good for reviewing EOLR and practicing your 4c recognition method. You can filter by MC/Non-MC cases too.

## Shortcuts
- Space for the next scramble.
- Enter to reset the virtual cube to current scramble. 
- Control your cube with cstimer key mapping.

## Functionalities
- Scrambles are all random state. Solver is Roux-optimized with M and r moves as first-class citizens, with up to 25 different solutions provided.

- You can control the virtual cube with keyboard (CStimer mapping). You can also drag on the cube to change its perspective.

- You can bookmark your favorite cases and these will be saved in your browser.

- You can input your own scrambles as a list and our trainer will drain them one by one!

- Appearance: dark mode enabled.

---

## Version Log 
- (v1.0.0) All work prior to 12/02/2020, which I forgot to version log for.
- (v1.0.1) 12/02/2020: Add edge position control for FB Last Pair trainer.
- (v1.1) 12/15/2020: Reworked UI. App bar now features a dropdown menu for selecting the mode. Scramble occupies its own row. Solutions are shown side by side with the sim cube in large screen.
- (v1.2) 12/17/2020: Add support for scramble input for all modes. Now you can paste in a list of scrambles, and the trainer will consume them one by one in order.
- (v1.3) 12/20/2020: Solve Analysis Beta is online! It can do the following:
    - For any random scramble, it'll recommend the best FB solutions over all orientations (e.g. x2y yellow/white). 
    - Given a solve reconstruction, it'll analyze each stage, and compare your solution there with the solver-suggested solutions.
- (v1.4) 12/23/2020: Refine the appearance of the virtual cube and enable camera control with mouse dragging. 
- (v1.5) 2/18/2021: Introduced Tracking Trainer Beta.

---

If you have ideas on how to improve the app just shoot a message and let me know. <3
`

function Intro() {
  return <Markdown>{introText}</Markdown>
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
      <DialogContent dividers>
        <Intro></Intro> 
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