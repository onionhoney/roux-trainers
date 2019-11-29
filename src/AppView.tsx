import React, { useEffect } from 'react'
import CubeSim from './CubeSim'
import { FaceletCube, CubieCube, Move, CubeUtil } from './CubeLib';
import { CubieT, MoveT } from "./Defs";
import { AppState, Selector, AppStateSetter, Config } from "./Types";

import { Checkbox, AppBar, Typography, Toolbar } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';

import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import 'typeface-roboto';
import clsx from 'clsx';

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 420,
  },
  title : {
      flexGrow: 1,
  }
}))

function SelectorGroupPanel(props: { selector: Selector, handleChange: (x: string) => () => void }) {
  let { selector, handleChange } = props
  var makeBox = (name: string, checked: boolean) => {
    return (
      <FormControlLabel
        control={
          <Checkbox checked={checked} onChange={handleChange(name)} />
        }
        label={name}
        color="primary"
        key={name}
      />)
  }
  return (
    <FormGroup row>
      {selector.names.map( (name, i) => makeBox(name, !!selector.flags[i]) ) }
    </FormGroup>
  );
}

// TODO: Write getter and setter for config items, and also write handlers that map to setters
function AppView(props: { state: AppState, setState: AppStateSetter } ) {
  //const [locations, setLocations] = React.useState([])
  let classes = useStyles()
  let { state, setState } = props
  let { cube, config } = state
  let facelet = FaceletCube.from_cubie(cube)
  let cmll_solved = CubeUtil.is_cmll_solved(cube)

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  const handleSelectorChange = (kind: string) => (name: string) => () => {
    if (kind === "cmll") {
    }
    let config_ = config as any
    let {names, flags} = config_[kind]

    let new_flags = [...flags]
    //
    let idx = names.indexOf(name)
    if (0 <= idx && idx < new_flags.length) {
      new_flags[idx] = 1 - new_flags[idx]
    }

    let new_config = {...config}
    let new_config_unsafe = (new_config as any)
    new_config_unsafe[kind].flags = new_flags;


    //console.log("setting new config to ")

    setState({
      config: new_config
    })
  }

  return (
    <main>
      <AppBar position="static">
      <Toolbar>
        {/*
        <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
          <MenuIcon />
        </IconButton>
        */}
        <Typography variant="h6" className={classes.title}>
          CMLL Trainer
        </Typography>
      </Toolbar>

      </AppBar>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3} justify="center" alignItems="center">
          <Grid item xs={12} md={10} lg={8} >
                <Paper className={fixedHeightPaper}>
                  <Box margin="auto">
                  <CubeSim
                    width={400}
                    height={400}
                    cube={facelet}
                    colorScheme={CubeUtil.ori_to_color_scheme(props.state.ori)}
                  />
                  </Box>
                </Paper>
          </Grid>
        </Grid>
        <Grid container spacing={3} justify="center" alignItems="center">
          <Grid item xs={12} md={10} lg={8}>
            <SelectorGroupPanel selector={ config.cmllSelector } handleChange= {handleSelectorChange("cmllSelector")} />
          </Grid>
          <Grid item xs={12} md={10} lg={8}>
            <SelectorGroupPanel selector={ config.triggerSelector } handleChange= {handleSelectorChange("triggerSelector")} />
          </Grid>
          <Grid item xs={12} md={10} lg={8}>
            <SelectorGroupPanel selector={ config.orientationSelector } handleChange= {handleSelectorChange("orientationSelector")} />
          </Grid>
        </Grid>

      </Container>

    </main>
  )
}
export default AppView