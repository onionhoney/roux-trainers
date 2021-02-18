import React from 'react'

import CubeSim from './CubeSim'
import { Button, makeStyles, Typography, useTheme, FormControl, FormLabel, Size, } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';

import { CubeUtil, CubieCube, FaceletCube, Mask, MoveSeq } from '../lib/CubeLib';

import { AppState,  Action, Config, FavCase, Mode} from "../Types";

import { getActiveName } from '../lib/Selector';
import classes from '*.module.css';
import { Face, FaceletCubeT } from '../lib/Defs';
import { rand_choice } from '../lib/Math';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles(theme => ({
    container: {
        paddingTop: theme.spacing(0),
        paddingBottom: theme.spacing(2),
        backgroundColor: theme.palette.background.default, 
        transition: "all .5s ease-in-out"
    },
    paper: {
        padding: theme.spacing(3),
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
        marginBottom: 3,
        borderRadius: 0
    },
})
)

type TrackerState = {
    mode: string,
    moveSet: string,
    moveCount: number,
    display: string,
    result: {
        cubeBefore: FaceletCubeT,
        cubeAfter: FaceletCubeT,
        moves: string
    } | null
}
const mode_to_mask = (mode: string) => {
    let mask = Mask.copy(Mask.empty_mask)
    if (mode === "sb-front-pair") {
        mask.ep[11] = 1
        mask.cp[7] = 1
    }
    return mask
}

const initialState : TrackerState = {
    mode: "sb-front-pair",
    moveSet: "UDFBrRM",
    moveCount: 5,
    display: "hidden",
    result: null
}


const axis : {[key: string]: number} = {
    "X": 0,
    "R": 1, "r": 1, "l": 1, "L": 1, "M": 1,
    "U": 2, "D": 2, "u": 2, "d": 2, "E": 2,
    "F": 3, "B": 3, "f": 3, "b": 3, "S": 3
}

function generateScramble(moveSet: string, moveCount: number) {
    let prev = "X"
    let prevprev = "X"
    let scramble = ""
    let moveList = moveSet.split("")
    for (let i = 0; i < moveCount; i++) {
        let move : string
        do {
            move = rand_choice(moveList)
        } while (move === prev ||
            ( axis[move] === axis[prev] && axis[move] === axis[prevprev]));
        prevprev = prev;
        prev = move;
        scramble += move + rand_choice(["", "2", "'"])
    }
    return scramble
}

function generateChallenge(state: TrackerState) {
    let mask = mode_to_mask(state.mode);
    let scrambleMoves = generateScramble(state.moveSet, 20)
    let cubeBefore = new CubieCube().apply(scrambleMoves)
    console.log("cube before ", cubeBefore)
    let moves = generateScramble(state.moveSet, state.moveCount)
    let cubeAfter = cubeBefore.apply(moves)

    return {
        cubeBefore: FaceletCube.from_cubie(cubeBefore, mask),
        cubeAfter: FaceletCube.from_cubie(cubeAfter, mask),
        moves
    }
}

function getInitialState() {
    let result = generateChallenge(initialState);
    return {...initialState, result}
}

function TrackerView(props: { state: AppState, dispatch: React.Dispatch<Action> } ) {
    let { state: globalState, dispatch: globalDispatch } = props
    const theme = useTheme()
    const simBackground = getActiveName(globalState.config.theme) === "bright" ? "#eeeeef" : theme.palette.background.paper

    let [ state, setState ] = React.useState(getInitialState)
    let classes = useStyles()

    let {cubeBefore, cubeAfter, moves} = state.result

    let handleClick = () => {
        if (state.display === "hidden") {
            setState({...state, display: "revealed"})
        } else {
            let result = generateChallenge(state);
            setState({...state, result, display: "hidden"})
        }
    }

    let onMoveSetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setState({...state, moveSet: event?.target.value})
    }
    let onMoveCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let mc = Number.parseInt(event?.target.value) 
        if (1 <= mc && mc <= 10) {
            setState({...state, moveCount: mc})
        }
    }

    return (
    <Box className={classes.container}>
      <Paper className={classes.paper} >
          {moves}
      </Paper>
      <Paper className={classes.paper} >
        <Button size="medium" variant="outlined" color="primary" onClick={handleClick}>
            {state.display === "hidden" ? "Reveal" : "Next" }
        </Button>
        <Box style={{display: "flex", alignItems: "center", flexGrow: 1}}>
        <TextField
          size="small"
          value={state.moveSet}
          onChange={onMoveSetChange}
          variant="filled"
        />
         <TextField
          size="small"
          value={state.moveCount}
          onChange={onMoveCountChange}
          variant="filled"
        />

      </Box>
      </Paper>
      <Paper className={classes.paper} >
        <Grid container>
        <Grid item sm={4} xs={5} style={{display: "flex", justifyContent: "center"}}>
          <Box>
            <CubeSim
              width={200}
              height={200}
              cube={cubeBefore}
              colorScheme={globalState.colorScheme.getColorsForOri(globalState.cube.ori)}
              hintDistance={ 5 }
              bgColor={simBackground}
              facesToReveal={ [Face.L, Face.B, Face.D]  }
            />
          </Box>
        </Grid>
        <Grid item sm={4} xs={5} style={{display: "flex", justifyContent: "center"}}>
          <Box>
            <CubeSim
              width={200}
              height={200}
              cube={state.display === "revealed" ? cubeAfter : FaceletCube.from_cubie(new CubieCube(), Mask.empty_mask) }
              colorScheme={globalState.colorScheme.getColorsForOri(globalState.cube.ori)}
              hintDistance={ 5 }
              bgColor={simBackground}
              facesToReveal={ [Face.L, Face.B, Face.D]  }
            />
          </Box>
        </Grid>
        </Grid>
      </Paper>
    </Box>
    )
}

export default TrackerView