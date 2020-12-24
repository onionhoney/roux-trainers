import React, { Fragment } from 'react'

import CubeSim from './CubeSim'
import { makeStyles, useTheme, FormControl, FormLabel, Typography, Button} from '@material-ui/core';

import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import { FaceletCube, Mask, MoveSeq } from '../lib/CubeLib';

import { AppState, Action, Config } from "../Types";
import clsx from 'clsx';
import { Face } from '../lib/Defs';
import { getActiveName } from '../lib/Selector';
import { MultiSelect, SingleSelect } from './Select';
import { ColorPanel } from './Input';


const useStyles = makeStyles(theme => ({
    container: {
      paddingTop: theme.spacing(0),
      paddingBottom: theme.spacing(2),
      backgroundColor: theme.palette.background.default
    },
    paper: {
      padding: theme.spacing(3),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
    },
    fixedHeight: {
      height: 350,
    },
    canvasPaper: {
      padding: theme.spacing(0),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
    },
    title : {
        color: theme.palette.text.hint,
        fontWeight: 500,
        fontSize: 18,
        borderBottom: "2px solid",
    },
    prompt: {
      color: theme.palette.text.secondary,
    },
    button: {
      width: "100%"
    },
}))



function _getMask(name: string) {
  switch (name) {
    case "Show": return Mask.solved_mask;
    case "Hide": return Mask.empty_mask;
    case "Hide LSE": return Mask.lse_mask;
    default: return Mask.solved_mask
  }
}
function CmllTrainerView(props: { state: AppState, dispatch: React.Dispatch<Action> } ) {
    let { state, dispatch } = props
    let cube = state.cube.state
    let classes = useStyles()
    const canvasPaper = clsx(classes.canvasPaper, classes.fixedHeight);
    let facelet = FaceletCube.from_cubie(cube,
      _getMask(getActiveName( state.config.cmllCubeMaskSelector) || "Show"))

    const theme = useTheme()

    const cmll = (c: Config) => c.cmllSelector;
    const cmllcubemask = (c : Config) => c.cmllCubeMaskSelector;
    const cmllauf = (c: Config) => c.cmllAufSelector;
    const trigger = (c: Config) => c.triggerSelector;

    const panel = (
      <Fragment>
        <SingleSelect {...{state, dispatch, select: cmllcubemask, label: "Virtual Cube"}} />
        <MultiSelect {...{state, dispatch, select: cmll, options: { label: "CMLL Case", noDialog: true} }} />
        <MultiSelect {...{state, dispatch, select: cmllauf, options: { label: "CMLL Auf", noDialog: true} }} />
        <MultiSelect {...{state, dispatch, select: trigger, options: { label: "SB Last Pair Trigger (Uncheck all for pure CMLL)", noDialog: true} } } />
        <ColorPanel {...{state, dispatch}} />
      </Fragment>
    )

    React.useEffect( () =>  {
      setReveal(false)
    }, [ state ])
    const [reveal, setReveal] = React.useState(false)
    const handleClick = () => {
      setReveal(true)
    }
    const handleNext = () => {
      dispatch({type: "key", content: "#space"})
    }

    React.useEffect(() => {
      function downHandler(event: KeyboardEvent) {
        state.keyMapping.handle(event, dispatch);
      }
      window.addEventListener('keydown', downHandler);
      return () => {
        window.removeEventListener('keydown', downHandler);
      };
    });

    let alg = ""
    let setup = ""
    if (state.case.desc.length === 4) {
      setup = state.case.desc[3].algs[0]
    }
    if (reveal && state.case.desc.length >= 3) {
      const moves = new MoveSeq(state.case.desc[1].algs[0] + state.case.desc[2].algs[0] )
      let moves_c = moves.collapse()
      if (moves_c.moves.length > 0) {
        if (moves_c.moves[0].name[0] === "U") {
          alg += "(" + moves_c.moves[0].name + ") ";
          moves_c.moves = moves_c.moves.slice(1)
        }
        alg += moves_c.toString()
      }
    }
    return (
    <Box className={classes.container}>
    <Grid container >
      <Grid item xs={12} >
            <Paper className={canvasPaper}>
              <Box margin="auto">
              <CubeSim
                width={400}
                height={350}
                cube={facelet}
                colorScheme={state.colorScheme.getColorsForOri(state.cube.ori)}
                theme={getActiveName(state.config.theme)}
                facesToReveal={[Face.L]}
              />
              </Box>
            </Paper>
      </Grid>
    </Grid>

    <Box height = {5}/>

    <Paper className={classes.paper} elevation={2}>
    <Grid container spacing={2}>

      <Grid item xs={3}>

      <Box display="flex">
              <Box>
              <Box className={classes.title} >
                Scramble
              </Box> </Box>
      </Box>
      </Grid>
      <Grid item xs={9}>
        <Box paddingBottom={1} lineHeight={1} >
          <Typography style={{whiteSpace: 'pre-line', fontSize: 18, fontWeight: 500}}>
            { setup }
          </Typography>
        </Box>

      </Grid>
      <Grid item xs={3}>

      <Box display="flex">
              <Box>
              <Box className={classes.title} >
                Case
              </Box> </Box>
      </Box>
      </Grid>
      { (!reveal) ?
      <Grid item xs={3}>
      <Button onFocus={(evt) => evt.target.blur() } className={classes.button}
      size="medium" variant="outlined" color="primary" onClick={handleClick}> { /* className={classes.margin}>  */ }
          Show
      </Button>
      </Grid>
      :
      <Grid item xs={9}>
        <Box paddingBottom={1} lineHeight={1} >
          <Typography style={{whiteSpace: 'pre-line', fontSize: 18, fontWeight: 500}}>
            { alg }
          </Typography>
        </Box>

      </Grid>
      }
    </Grid>
    <Box height={30}/>

    <Grid container spacing={0}>
        <Grid item xs={4} sm={4} md={3}>
          <Button onFocus={(evt) => evt.target.blur() } className={classes.button}
          size="medium" variant="contained" color="primary" onClick={handleNext}>
              Next
          </Button>
        </Grid>
    </Grid>
    </Paper>


    <Box height={20}/>
      <Divider />
    <Box height={20}/>
    { panel }

    <Box height={20}/>
      <Divider />
    <Box height={15}/>

    <Box>
    <FormControl component="fieldset" className={classes.prompt}>
      <FormLabel component="legend">
         Usage: Press space for next case. Enter to redo.
      </FormLabel>
      </FormControl>
    </Box>

    </Box>
    );
}

export default CmllTrainerView


