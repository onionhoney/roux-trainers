import React from 'react'

import CubeSim from './CubeSim'
import { Button, makeStyles, Typography, useTheme, FormControl, FormLabel, Size, } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';

import { CubeUtil, CubieCube, FaceletCube, Mask, MoveSeq } from '../lib/CubeLib';

import { AppState,  Action, Config, FavCase, Mode} from "../Types";

import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem'

import classes from '*.module.css';
import { Face, FaceletCubeT } from '../lib/Defs';
import { rand_choice, rand_int, rand_shuffle } from '../lib/Math';
import TextField from '@material-ui/core/TextField';
import { CachedSolver } from '../lib/CachedSolver';
import { SolverT } from '../lib/Solver';

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
    select: {
        margin: "0px 10px"
    },
    scramble: {
        whiteSpace: 'pre-line',
        fontSize: "1.4rem",
        fontWeight:500,
    },
    title: {
        color: theme.palette.text.hint,
        fontWeight: 500,
        borderBottom: "3px solid",
    },
    fgap: {
        flexShrink: 100, flexBasis: "2.5rem", minWidth: "1.5em",
        [theme.breakpoints.down('xs')]: {
          flexBasis: "1.0rem", 
          minWidth: "0.4rem"
        }
    }
})
)


type TrackerChallenge = {
        cubeBefore: CubieCube
        moves: string,
        progress: number,
        mask: Mask
}

type TrackerState = {
    mode: string,
    moveSet: string,
    moveCount: number,
    display: string,
    result: TrackerChallenge | null
}

const initialState : TrackerState = {
    mode: "fb,ss",
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

const mode_to_mask = (mode: string) => {
    let mask = Mask.copy(Mask.empty_mask)
    if (mode === "fb,ss") {

    }
    return mask
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

function generateMoves(cube: CubieCube, solver: SolverT, moveSet: string, moveCount: number) {
    let candidate = moveSet.split("").map(x => [x, x + "2", x + "'"]).flat()
    let moves = ""
    let prev = "X"
    let prevprev = "X"
    let prevSolution = " "

    for (let i = 0; i < moveCount; i++) {
        let c = [...candidate]
        rand_shuffle(c)
        while (c.length > 0){
            let next = c[c.length-1]
            if (next[0] === prev ||
                (axis[next[0]] === axis[prev] && axis[prev] === axis[prevprev])) {
                    c.pop()
                    continue
             }
            let moveSeq = solver.solve(cube.apply(next), 0, i + 1, 1)[0]
            if (!!moveSeq && moveSeq.toString() !== prevSolution){
                cube = cube.apply(next)
                moves = moves + next

                prevSolution = moveSeq.toString()
                prevprev = prev
                prev = next[0]
                break
            }
            c.pop()
        }
        if (c.length === 0) { // unsuccessful
            return new MoveSeq("")
        }
        //if (new MoveSeq(prevSolution).moves.length === moveCount) break;
    }
    return new MoveSeq(moves)
}

function generateChallengeForFB(state: TrackerState): TrackerChallenge {
    let solver = CachedSolver.get("fb")
    let cubeAfter = CubeUtil.get_random_with_mask(Mask.fb_mask)
    let moves = generateMoves(cubeAfter, solver, state.moveSet, state.moveCount)
    //solver.solve(cubeBefore, state.moveCount, state.moveCount, 1)[0]
    let mask = Mask.copy(Mask.empty_mask) // empty_mask) // fbdr_mask)
    if (state.mode === "fb,sp" || state.mode === "fb,ss") {
        if (rand_int(2) === 0) {
            mask.ep[11] = 1
            mask.cp[7] = 1
        } else {
            mask.ep[10] = 1
            mask.cp[6] = 1
        }
    }
    if (state.mode === "fb,dr" || state.mode === "fb,ss") {
        mask.ep[7] = 1
    }
    return {
        cubeBefore: cubeAfter.apply(moves),
        mask,
        moves: moves.inv().toString(),
        progress: 0,
    }
}

function generateChallengeForFS(state: TrackerState): TrackerChallenge {
    let mode = rand_choice(["fs-front", "fs-back"])
    let solver = CachedSolver.get(mode)
    let cubeAfter = CubeUtil.get_random_with_mask(mode === "fs-back" ? Mask.fs_back_mask : Mask.fs_front_mask)
    let moves = generateMoves(cubeAfter, solver, state.moveSet, state.moveCount)
    //solver.solve(cubeBefore, state.moveCount, state.moveCount, 1)[0]
    let mask = Mask.copy(Mask.empty_mask) // empty_mask) // fbdr_mask)
    if (mode === "fs-back") {
        mask.ep[8] = 1
        mask.cp[4] = 1
    } else {
        mask.ep[9] = 1
        mask.cp[5] = 1
    }
    if (state.mode === "fs,lp+dr") {
        mask.ep[7] = 1
    }
    return {
        cubeBefore: cubeAfter.apply(moves),
        mask,
        moves: moves.inv().toString(),
        progress: 0,
    }
}


function generateChallenge(state: TrackerState) {
    if (state.mode.slice(0, 3) === "fb,") {
        return generateChallengeForFB(state)
    } else return generateChallengeForFS(state)
}

function getInitialState() {
    let result = generateChallenge(initialState);
    return {...initialState, result}
}

function TrackerView(props: { state: AppState, dispatch: React.Dispatch<Action> } ) {
    let { state: globalState, dispatch: globalDispatch } = props
    const theme = useTheme()
    const simBackground = globalState.config.theme.getActiveName() === "bright" ? "#eeeeef" : theme.palette.background.paper

    let [ state, setState ] = React.useState(getInitialState)
    let classes = useStyles()

    let {cubeBefore, mask, moves, progress} = state.result!
    let cube1 = FaceletCube.from_cubie(cubeBefore.apply(
           new MoveSeq(moves).toQuarter().slice(progress)), mask)

    console.log("moves", moves)
    let cube2 = FaceletCube.from_cubie(cubeBefore.apply(moves), mask)


    // React.useEffect( () => {
    //     const t = new MoveSeq(moves).toQuarter().moves.length
    //     let new_progress = 0
    //     const timer = setInterval(() => {
    //         new_progress++
    //         if (new_progress > t) clearTimeout(timer)
    //         setState( (state) => (
    //             {...state, result: {...state.result, progress: new_progress} }
    //         ))
    //     }, 800);
    //     return () => clearInterval(timer);
    // }, [cubeBefore, moves])

    let handleClick = () => {
        if (state.display === "hidden") {
            setState({...state, display: "revealed"})
        } else {
            let result = generateChallenge(state);
            setState({...state, result, display: "hidden"})
        }
    }

    let handleProgress = (func: (x : number) => number) => () => {
        setState( (state) => (
            {...state, result: {...state.result, progress: func(state.result.progress)} }
        ))
    }

    let [ moveSetText, setMoveSetText ] = React.useState(state.moveSet)
    let onMoveSetEdit = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMoveSetText(event?.target.value)
        onMoveSetCommit()
    }
    let onMoveSetCommit = () => {
        setState({...state, moveSet: moveSetText})
    }

    let handleMode = (event: React.ChangeEvent<{ value: unknown }>) => {
        let value = (event.target.value as string)
        setState({...state, mode: value})
    }
    let handleMoveCount = (event: React.ChangeEvent<{ value: unknown }>) => {
        let value = Number.parseInt(event.target.value as string) || 5
        setState({...state, moveCount: value})
    }

    return (
    <Box className={classes.container}>
      <Paper className={classes.paper} >
        <Box display="flex" >
          <Box>
          <Box className={classes.title} style={{}}>
            Scramble
          </Box></Box>
          <Box style={{}} className={classes.fgap} />
          <Typography className={classes.scramble}>
            {moves}
          </Typography>
        </Box>
      </Paper>
      <Paper className={classes.paper} >

        <Box style={{display: "flex", alignItems: "center", flexGrow: 1}}> 

        <Box style={{padding: 10}} display="flex" flexWrap="wrap" flexDirection="row">
        <Box className={classes.select}>
            <FormControl>
                <InputLabel>Mode</InputLabel>
                <Select
                    value={state.mode}
                    onChange={handleMode}
                >
                <MenuItem value={"fs,lp"}>Watch FS, Track Last Pair</MenuItem>
                <MenuItem value={"fs,lp+dr"}>Watch FS, Track Last Pair + DR</MenuItem>
                <MenuItem value={"fb,dr"}>Watch FB, Track DR </MenuItem>
                <MenuItem value={"fb,sp"}>Watch FB, Track SB Pair </MenuItem>
                <MenuItem value={"fb,ss"}>Watch FB, Track DR + SB Pair </MenuItem>
                <MenuItem value={"cross,pair"}>Watch Cross, Track F2L Pair (will not be implemented, of course)</MenuItem>
                </Select>
                {/* <FormHelperText></FormHelperText> */}
            </FormControl>
        </Box>

        <Box className={classes.select}>
            <FormControl>
                <InputLabel>MoveCount</InputLabel>
                <Select
                    value={state.moveCount}
                    onChange={handleMoveCount}
                    style={{minWidth: 80}}
                >
                <MenuItem value={"3"}>3</MenuItem>
                <MenuItem value={"4"}>4</MenuItem>
                <MenuItem value={"5"}>5</MenuItem>
                <MenuItem value={"6"}>6</MenuItem>
                <MenuItem value={"7"}>7</MenuItem>
                <MenuItem value={"8"}>8</MenuItem>
                </Select>
                {/* <FormHelperText></FormHelperText> */}
            </FormControl>
        </Box>

        <Box className={classes.select}>
                <TextField
                    size="small"
                    value={moveSetText}
                    label="MoveGroup"
                    onChange={onMoveSetEdit}
                />
                {/* <FormHelperText></FormHelperText> */}
        </Box>
                {/* <Box style={{paddingTop: 10}}>
                <Button
                    color="primary"
                    size="medium"
                    onClick={onMoveSetCommit} >
                    Confirm
                </Button>
                </Box> */}
                {/* <FormHelperText></FormHelperText> */}
                {/* <FormHelperText></FormHelperText> */}
      </Box>

      </Box>
      </Paper>
      <Paper className={classes.paper}>
            <Box style={{paddingBottom: 10, margin: "0px auto"}}>
                <Button color="primary" size="medium"
                onClick={handleProgress((x) => 0) } >
                    {"|<<"}
                </Button>

                <Button color="primary" size="medium"
                onClick={handleProgress((x) => x - 1) } >
                    {"<<"}
                </Button>
                <Button color="primary" size="medium"
                onClick={handleProgress((x) => x + 1) } >
                    {">>"}
                </Button>
                <Button color="primary" size="medium"
                onClick={handleProgress((x) => x + 1) } >
                    {">>|"}
                </Button>
            </Box>
        <Button size="medium" variant="outlined" color="primary" onClick={handleClick}>
            {state.display === "hidden" ? "Reveal" : "Next" }
        </Button>

      </Paper>
      <Paper className={classes.paper} >
        <Grid container style={{display: "flex"}}>
        <Grid item sm={6} xs={6} style={{display: "flex", justifyContent: "center"}}>
          <Box>
            <CubeSim
              width={250}
              height={250}
              cube={cube1}
              colorScheme={globalState.colorScheme.getColorsForOri(globalState.cube.ori)}
              hintDistance={ 5 }
              theme={globalState.config.theme.getActiveName()}
              facesToReveal={ [Face.L, Face.B, Face.D]  }
            />
          </Box>
        </Grid>

        <Grid item sm={6} xs={6} style={{display: "flex", justifyContent: "center"}}>
          <Box>
            <CubeSim
              width={250}
              height={250}
              cube={state.display === "revealed" ? cube2: FaceletCube.from_cubie(new CubieCube(), Mask.empty_mask) }
              colorScheme={globalState.colorScheme.getColorsForOri(globalState.cube.ori)}
              hintDistance={ 5 }
              theme={globalState.config.theme.getActiveName()}
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