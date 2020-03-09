import React from 'react'

import CubeSim from './CubeSim'
import { Checkbox, FormControlLabel, FormGroup, makeStyles, Divider, Typography, FormControl, FormLabel, RadioGroup } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
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
    infoColumn: {
      color: "gray" //theme.palette.background.paper
    },
    textColumn: {
      color: "black"
    },
    fixedHeight: {
      height: 420,
    },
    title : {
        flexGrow: 1,
    },

  }))



function FbdrTrainerView(props: { state: AppState, dispatch: React.Dispatch<Action> } ) {
    let { state, dispatch } = props
    let cube = state.cube.state
    let config = state.config
    let classes = useStyles()
    const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
    let facelet = FaceletCube.from_cubie(cube)

    let desc = state.case.desc[0] || { alg: "", setup:"Press space for new case"}
    let { alg, setup, alt_algs } = desc
    let alg_str = (alt_algs || []).join("\n")

    const handleChange = (evt: { target: { value: string; }; }) => {
      let { names, flags } = state.config.fbdrSelector
      let n = names.length
      let new_flags = Array(n).fill(0)

      for (let i = 0; i < names.length; i++) {
        if (names[i] === evt.target.value) {
          new_flags[i] = 1
        }
      }
      let new_config = {...config, fbdrSelector: {...state.config.fbdrSelector, flags: new_flags}}
      dispatch( { type: "config", content: new_config })
    }
    let sel = state.config.fbdrSelector
    let radioValue = function() {
      let { names, flags } = sel
      for (let i = 0; i < flags.length; i++) {
        if (flags[i] === 1) return names[i]
      }
      return ""
    }()

    return (
    <Box className={classes.container}>
      <Container maxWidth="sm" className={classes.container}>

      <Paper className={classes.paper} elevation={2}>
      <Grid container xs={12} md={12} spacing={2}>
        <Grid item xs={6}>
        <Grid container xs={12} spacing={3} justify="center" alignItems="center">
          <Grid item xs={12} className={classes.infoColumn} >
            <Box display="flex">
              <Box fontWeight={500} border={3} borderTop={0} borderLeft={0} borderRight={0}
                   color="primary.main" borderColor="primary.main">
                Scramble
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} className={classes.textColumn} >
            <Box paddingBottom={3} lineHeight={2} fontSize={20} fontWeight={400}>
              {setup}
            </Box>
          </Grid>
        </Grid>
        </Grid>

        <Grid item xs={6}>
        <Grid container xs={12} spacing={3} justify="center" alignItems="center">
          <Grid item xs={12}className={classes.infoColumn} >
            <Box display="flex" >
                <Box fontWeight={500} border={3} borderTop={0} borderLeft={0} borderRight={0}
                    color="primary.main" borderColor="primary.main">
                  Solution
                </Box>
            </Box>
          </Grid>

          <Grid item xs={12} className={classes.textColumn} >
            <Box paddingBottom={3} lineHeight={2} fontSize={20} fontWeight={400}>
              <Box>
                {state.name === "hiding" ? "-" :  alg}
              </Box>
            </Box>

          </Grid>
        </Grid>
        </Grid>

      </Grid>
      </Paper>

      <Box height={20}/>
      <Divider/>
      <Box height={20}/>
        <FormControl component="fieldset">
          <FormLabel component="legend">Position of last pair</FormLabel>
          <RadioGroup aria-label="position" name="position" value={radioValue} onChange={handleChange} row>
            {
              sel.names.map(name => (
                <FormControlLabel
                  value={name}
                  control={<Radio color="primary" />}
                  label={name}
                  labelPlacement="end"
                />
              ))
            }
          </RadioGroup>
        </FormControl>
      </Container>
</Box>




    );
}

export default FbdrTrainerView


