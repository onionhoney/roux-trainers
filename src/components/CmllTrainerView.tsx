import React from 'react'

import CubeSim from './CubeSim'
import { Checkbox, FormControlLabel, FormGroup, makeStyles } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import { FaceletCube, CubeUtil } from '../lib/CubeLib';

import { AppState, Selector, Action, Config } from "../Types";
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
    canvasPaper: {
      padding: theme.spacing(0),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
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

function CmllTrainerView(props: { state: AppState, dispatch: React.Dispatch<Action> } ) {
    let { state, dispatch } = props
    let cube = state.cube.state
    let config = state.config
    let classes = useStyles()
    const canvasPaper = clsx(classes.canvasPaper, classes.fixedHeight);
    let facelet = FaceletCube.from_cubie(cube)


    const handleSelectorChange = React.useCallback( (selectorSel: (x: Config) => Selector) => (name: string) => {
        return function () {
          let {names , flags} = selectorSel(config)
          let new_flags = [...flags]
          let idx = names.indexOf(name)
          if (0 <= idx && idx < new_flags.length) {
            new_flags[idx] = 1 - new_flags[idx]
          }

          let new_config = {...config}
          let sel = selectorSel(new_config)
          sel.flags = new_flags
          //console.log("setting new config to ")
          dispatch( { type: "config", content: new_config })
        }
      }, [ config, dispatch ] )

    return (
    <Container maxWidth="lg" className={classes.container}>
    <Grid container spacing={3} justify="center" alignItems="center">
      <Grid item xs={12} md={10} lg={8} >
            <Paper className={canvasPaper}>
              <Box margin="auto">
              <CubeSim
                width={400}
                height={400}
                cube={facelet}
                colorScheme={CubeUtil.ori_to_color_scheme(props.state.cube.ori)}
              />
              </Box>
            </Paper>
      </Grid>
    </Grid>
    <Grid container spacing={3} justify="center" alignItems="center">
      <Grid item xs={12} md={10} lg={8}>
        <SelectorGroupPanel selector={ config.cmllSelector } handleChange= {handleSelectorChange(d => d.cmllSelector)} />
      </Grid>
      <Grid item xs={12} md={10} lg={8}>
        <SelectorGroupPanel selector={ config.cmllAufSelector } handleChange= {handleSelectorChange(d => d.cmllAufSelector)} />
      </Grid>
      <Grid item xs={12} md={10} lg={8}>
        <SelectorGroupPanel selector={ config.triggerSelector } handleChange= {handleSelectorChange(d => d.triggerSelector)} />
      </Grid>
      <Grid item xs={12} md={10} lg={8}>
        <SelectorGroupPanel selector={ config.orientationSelector } handleChange= {handleSelectorChange(d => d.orientationSelector)} />
      </Grid>
    </Grid>
    </Container>
    );
}

export default CmllTrainerView


