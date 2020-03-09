import React from 'react'

import CubeSim from './CubeSim'
import { Checkbox, FormControlLabel, FormGroup, Button, makeStyles, Divider, Typography, FormControl, FormLabel, RadioGroup } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import { FaceletCube, CubeUtil, Mask } from '../lib/CubeLib';

import { AppState, Selector, Action, Config } from "../Types";
import 'typeface-roboto';
import clsx from 'clsx';


const useStyles = makeStyles(theme => ({
    container: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),

    },
    button: {
      margin: theme.spacing(1),
    },
    paper: {
      padding: theme.spacing(2),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
    },
    canvasPaper: {
      padding: theme.spacing(0),
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
      height: 250,
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
    let facelet = FaceletCube.from_cubie(cube, Mask.fbdr_mask)

    let desc = state.case.desc[0] || { alg: "", setup:"Press space for new case"}
    let { alg, setup, alt_algs } = desc
    //let alg_str = (alt_algs || []).join("\n")

    let spaceButtonText = (state.name === "hiding") ? "Reveal" : "Next"
    let enterButtonText = "Reveal All"

    let algText = (state.name === "hiding") ? "-" :
      (state.name === "revealed") ? alg : alg + "\n" + (alt_algs || []).join("\n")

    const handleSpace = () => {
      dispatch({type: "key", content: "#space"})
    }
    const handleEnter = () => {
      dispatch({type: "key", content: "#enter"})
    }
    const handleChange = (evt: { target: { value: string; }; }) => {
      let { names } = state.config.fbdrSelector
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

      <Grid container>
        <Grid item xs={12}>
        <Paper className={ clsx(classes.canvasPaper, classes.fixedHeight) }>
          <Box margin="auto">
            <CubeSim
              width={250}
              height={250}
              cube={facelet}
              colorScheme={CubeUtil.ori_to_color_scheme(props.state.cube.ori)}
            />
          </Box>
        </Paper>
        </Grid>
      </Grid>

      <Paper className={classes.paper} elevation={2}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
        <Grid container spacing={3} justify="center" alignItems="center">
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

        <Grid item xs={12} sm={6}>
        <Grid container spacing={3} justify="center" alignItems="center">
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
              <Typography style={{whiteSpace: 'pre-line'}} >
                {algText}
              </Typography>
            </Box>

          </Grid>
        </Grid>
        </Grid>

      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Button className={classes.button} size="medium" variant="contained" color="primary" onClick={handleSpace}> { /* className={classes.margin}>  */ }
              {spaceButtonText}
          </Button>
          <Button className={classes.button} size="medium" variant="contained" color="primary" onClick={handleEnter}> { /* className={classes.margin}>  */ }
              {enterButtonText}
          </Button>
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
                  key={name}
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


