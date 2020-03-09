import React from 'react'
import { AppState, Mode, Action } from "../Types";

import { Box, AppBar, Typography, Tabs, Tab, makeStyles } from '@material-ui/core';

import CmllTrainerView from './CmllTrainerView';
import FbdrTrainerView from './FbdrTrainerView';


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
    backgroundColor: "#eee"
  }
}))

// TODO: Write getter and setter for config items, and also write handlers that map to setters
function AppView(props: { state: AppState, dispatch: React.Dispatch<Action> } ) {
  //const [locations, setLocations] = React.useState([])
  let { state, dispatch } = props
  let classes = useStyles()

  const handleChange = React.useCallback( (_:any, newValue:number) => {
    setValue(newValue)
    let modes : Mode[] = ["cmll", "fbdr"]
    let mode = modes[newValue]
    dispatch({type: "mode", content: mode})
  }, [dispatch])
  const [value, setValue] = React.useState(1);
  return (
    <main>
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
          <Tab label="CMLL Trainer" id='tab0'/>
          <Tab label="FBDR Trainer" id='tab1' />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0} className={classes.page}>
        <CmllTrainerView {...{state, dispatch}} />
      </TabPanel>
      <TabPanel value={value} index={1} className={classes.page}>
        <FbdrTrainerView {...{state, dispatch}} />
      </TabPanel>

    </main>
  )
}
export default AppView