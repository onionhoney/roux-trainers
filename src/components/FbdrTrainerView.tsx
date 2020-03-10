import React from 'react'

import CubeSim from './CubeSim'
import { FormControlLabel, Button, makeStyles, Divider, Typography, FormControl, FormLabel, RadioGroup } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import { FaceletCube, CubeUtil, Mask, Move } from '../lib/CubeLib';

import { AppState,  Action} from "../Types";
import 'typeface-roboto';
import clsx from 'clsx';
import { Face } from '../lib/Defs';


const useStyles = makeStyles(theme => ({
    container: {
      paddingTop: theme.spacing(0),
      paddingBottom: theme.spacing(2),
    },
    button: {
      margin: theme.spacing(0),
    },
    paper: {
      padding: theme.spacing(3),
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
    scrambleColumn: {
      paddingLeft: theme.spacing(3)
    },
    textColumn: {
      color: "black",
      [theme.breakpoints.up('sm')]: {
        minHeight: 138
      },
    },
    fixedHeight: {
      height: 250,
    },
    title : {
        flexGrow: 1,
    },

  }))


function getMask(state: AppState) : Mask {
    if (state.mode === "fbdr")
      return Mask.fbdr_mask
    else if (state.mode === "ss") {
      if (state.case.desc.length === 0) return Mask.sb_mask
      if (state.case.desc[0].kind === "ss-front")
        return Mask.ss_front_mask
      else
        return Mask.ss_back_mask
    }
    else
      return Mask.sb_mask
}

function FbdrTrainerView(props: { state: AppState, dispatch: React.Dispatch<Action> } ) {
    let { state, dispatch } = props
    let cube = state.cube.state
    let classes = useStyles()

    let facelet = FaceletCube.from_cubie(cube, getMask(state))

    let desc = state.case.desc[0] || { alg: "", setup:"Press next for new case"}
    let { alg, setup, alt_algs } = desc

    let spaceButtonText = (state.name === "hiding") ? "Reveal" : "Next"
    let algs = (alt_algs !== undefined) ? ( [alg, ...alt_algs] ) : [alg]

    // For debug
    // let alg_scores = algs.map(a => a + "," + Move.evaluate(Move.parse(a)).toFixed(2) )

    let minMove = algs.map(a => Move.parse(a).length).reduce( (a, b) => Math.min(a, b), 100 )
    let algText = (state.name === "hiding") ? `(Best = ${minMove} STM)`
      : (state.name === "revealed" && alg.length > 0) ? algs.join("\n") : ""

    const handleSpace = () => {
      dispatch({type: "key", content: "#space"})
    }

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
              facesToReveal={ [Face.L, Face.B, Face.D]  }
            />
          </Box>
        </Paper>
        </Grid>
      </Grid>

      <Paper className={classes.paper} elevation={2}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} className={classes.scrambleColumn} >
        <Grid container spacing={2} justify="center" alignItems="center">
          <Grid item xs={12} className={classes.infoColumn} >
            <Box display="flex">
              <Box fontWeight={500} border={3} borderTop={0} borderLeft={0} borderRight={0}
                   color="primary.main" borderColor="primary.main">
                Scramble
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}  >
            <Box paddingBottom={1} lineHeight={1} fontSize={20} fontWeight={400} className={classes.textColumn}>
            <Typography style={{whiteSpace: 'pre-line', fontSize: 20, fontWeight: 400}} >
                {setup}
              </Typography>
            </Box>
          </Grid>


        </Grid>
        </Grid>

        <Grid item xs={12} sm={6}>
        <Grid container spacing={2} justify="center" alignItems="center">
          <Grid item xs={12}className={classes.infoColumn} >
            <Box display="flex" >
                <Box fontWeight={500} border={3} borderTop={0} borderLeft={0} borderRight={0}
                    color="primary.main" borderColor="primary.main">
                  Solution
                </Box>
            </Box>
          </Grid>

          <Grid item xs={12} className={classes.textColumn} >
            <Box paddingBottom={2} lineHeight={1} fontSize={10} fontWeight={400}>
              <Typography style={{whiteSpace: 'pre-line', fontSize: 16}} >
                {algText}
              </Typography>
            </Box>

          </Grid>
        </Grid>
        </Grid>

      </Grid>

      <Grid container spacing={0}>
        <Grid item xs={6}>
          <Button  onFocus={(evt) => evt.target.blur() } className={classes.button} size="medium" variant="contained" color="primary" onClick={handleSpace}> { /* className={classes.margin}>  */ }
              {spaceButtonText}
          </Button>
        </Grid>
      </Grid>

      </Paper>

      <Box height={20}/>
      <Divider/>
      <Box height={20}/>

      <ConfigPanel {...{state, dispatch}}> </ConfigPanel>
      </Container>
</Box>

    );
}

function ConfigPanel(props: {state: AppState, dispatch: React.Dispatch<Action>}) {
  let { state, dispatch } = props
  let { config } = state
  let { mode } = state

  let sel = ( mode === "fbdr") ? config.fbdrSelector : config.ssSelector
  const handleChange = (evt: { target: { value: string; }; }) => {
    let { names } = sel
    let n = names.length
    let new_flags = Array(n).fill(0)

    for (let i = 0; i < names.length; i++) {
      if (names[i] === evt.target.value) {
        new_flags[i] = 1
      }
    }
    let new_config = (mode === "fbdr") ?
      {...config, fbdrSelector: {...state.config.fbdrSelector, flags: new_flags}}
    : {...config, ssSelector: {...state.config.ssSelector, flags: new_flags}}

    dispatch( { type: "config", content: new_config })
  }

  let radioValue = function() {
    let { names, flags } = sel
    for (let i = 0; i < flags.length; i++) {
      if (flags[i] === 1) return names[i]
    }
    return ""
  }()

  let label = ( mode === "fbdr") ? "Position of square" : "Position of square"
  return (
    <FormControl component="fieldset">
    <FormLabel component="legend">{label}</FormLabel>
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
  </FormControl>)
}

export default FbdrTrainerView


