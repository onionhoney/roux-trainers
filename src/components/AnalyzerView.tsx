import React, { Fragment } from 'react'

import CubeSim from './CubeSim'
import { Button, makeStyles, Typography, useTheme, FormControl, FormLabel, Size, } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';

import FavoriteIcon from '@material-ui/icons/Favorite';
import CheckIcon from '@material-ui/icons/Check';

import { CubeUtil, CubieCube, FaceletCube, Mask, MoveSeq } from '../lib/CubeLib';

import { AppState,  Action, Config, FavCase, Mode} from "../Types";
import 'typeface-roboto-mono';
import { Face } from '../lib/Defs';
import { getActiveName } from '../lib/Selector';

import { SingleSelect, MultiSelect } from './Select';
import { ColorPanel } from './Input';
import { AlgDesc } from '../lib/Algs';
import TextField from '@material-ui/core/TextField';

import { AnalyzerState, SolverConfig, SolutionDesc, initialState, analyze_roux_solve } from '../lib/Analyzer';

import * as Comlink from 'comlink';
/* eslint-disable import/no-webpack-loader-syntax */
import Worker from "worker-loader!../lib/Worker";
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';

import Chip from '@material-ui/core/Chip';
import { BoxBufferGeometry, BoxHelper } from 'three';
import { CachedSolver } from '../lib/CachedSolver';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import EditIcon from '@material-ui/icons/Edit';

import SearchIcon from '@material-ui/icons/Search';
import { createNonNullChain } from 'typescript';

// web work solution: worker-loader + comlink interface
// https://dev.to/nicolasrannou/web-workers-in-create-react-app-cra-without-unmounting-4865
// https://github.com/webpack-contrib/worker-loader#integrating-with-typescript
// const worker = new Worker()
// const obj = Comlink.wrap(worker)
// async function init() {
//   await (obj as any).inc();
//   await (obj as any).inc();
//   let ct = await (obj as any).counter
//   console.log("Testing ",  ct);
// }
// init()


const useStyles = makeStyles(theme => ({
    container: {
      paddingTop: theme.spacing(0),
      paddingBottom: theme.spacing(2),
      backgroundColor: theme.palette.background.default, 
      transition: "all .5s ease-in-out"
    },
    button: {
      width: "100%",
    },
    paper: {
      padding: theme.spacing(3),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
      marginBottom: 3,
      borderRadius: 0
    },
    paper2: {
      paddingLeft: theme.spacing(3),
      paddingTop: theme.spacing(2),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
      marginBottom: 3,
      borderRadius: 0
    },
    canvasPaper: {
      padding: theme.spacing(0),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
    },
    infoColumn: {
      color: theme.palette.background.paper
    },
    scrambleColumn: {
      paddingLeft: theme.spacing(3)
    },
    textColumn: {
      // color: "black",
      [theme.breakpoints.up('sm')]: {
        minHeight: 138
      },
    },
    setup: {
      whiteSpace: 'pre-line',
      fontSize: "1.4rem",
      fontWeight:500,
      [theme.breakpoints.down('xs')]: {
      fontSize: "1.0rem",
      fontWeight: 500
      },
  },
    condGap: {
    },
    fgap: {
      flexShrink: 100, flexBasis: "2.5rem", minWidth: "1.5em",
      [theme.breakpoints.down('xs')]: {
        flexBasis: "1.0rem", 
        minWidth: "0.4rem"
      }
    },
    fixedHeight: {
      height: 250,
    },
    title : {
        color: theme.palette.text.hint,
        fontWeight: 500,
        borderBottom: "3px solid",
    },
    title1 : {
      fontWeight: 500,
      marginTop: 7,         
      border: "1px solid",
      borderRadius: 4,
      fontSize: "0.8rem"
   },
    stage: {
      paddingTop: 5,
      paddingLeft: 5,

    },
    stageText: {
      color: theme.palette.text.primary,
      textTransform: "none"
    },
    sourceIcon : {
        color: theme.palette.secondary.main,
        fontSize: 15,
        padding: 0
    },
    sourceIconWrap : {
        //border: "1px solid " + theme.palette.text.hint,
        //borderRadius: 3
    },
    fab: {
      position: 'absolute',
      top: theme.spacing(7),
      left: theme.spacing(2),
    },
    prompt: {
      color: theme.palette.text.secondary,
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
  }))

const resetState = (state: AnalyzerState) => {
  return {
    ...state,
    postScramble: "",
    full_solution: [],
    scramble: "",
    stage: "fb"
  }
}
function ScrambleView(props: { state: AnalyzerState, setState: (newState: AnalyzerState) => void }) {
    let { state, setState } = props
    let classes = useStyles()
    // Add event listeners
    let [ value, setValue ] = React.useState(state.scramble)

    let onScrambleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event?.target.value)
    }

    let handleBegin = () => {

      setState({...resetState(state), scramble: value})
    }
    let handleGen = () => {
      let cube = CubeUtil.get_random_with_mask(Mask.empty_mask)
      let scramble = CachedSolver.get("min2phase").solve(cube,0,0,0)[0].inv().toString()
      setState({...resetState(state), scramble})
      setValue(scramble)
    }

    return (
    <Box style={{display: "flex"}}>
      <Box style={{display: "flex", alignItems: "center"}}> 
        <Box className={classes.title} style={{}}>
        Scramble
      </Box> </Box>
      <Box style={{}} className={classes.fgap} />          
      <Box style={{display: "flex", alignItems: "center", flexGrow: 1}}>
        <TextField
          size="medium"
          fullWidth
          value={value}
          onChange={onScrambleChange}
          variant="filled"
        />
      </Box>
      <Box style={{}} className={classes.fgap} />
      <Button onFocus={(evt) => evt.target.blur() } onClick={handleGen}
            size="medium" variant="contained" color="primary" >
              Gen
      </Button>
      <Button onFocus={(evt) => evt.target.blur() } onClick={handleBegin}
            size="medium" variant="contained" color="primary" >
              GO
      </Button>
    </Box> )
}

const bases = ""
function ConfigView(props: { state: AnalyzerState, setState: (newState: AnalyzerState) => void}) {
  let { state, setState } = props
  let classes = useStyles()
  let fb_ori_str = state.orientation + "," + state.pre_orientation
  let handleFBOri = (event: React.ChangeEvent<{ value: unknown }>) => {
    let value: string[]= (event.target.value as string).split(",")
    setState({...state, orientation: value[0], pre_orientation: value[1]})
  }
  let display_mode_str = state.show_mode
  let handle_display_mode = (event: React.ChangeEvent<{ value: unknown }>) =>  {
    let value = (event.target.value as string)
    setState({...state, show_mode: value})
  }
  let handle_num_solution = (event: React.ChangeEvent<{ value: unknown }>) =>  {
    let value = Number.parseInt(event.target.value as string)
    setState({...state, num_solution: value || state.num_solution})
  }
  return (
  <Box style={{display: "flex"}}>
    <FormControl className={classes.formControl}>
      <InputLabel id="demo-simple-select-helper-label">FB Orientation</InputLabel>
      <Select
        labelId="demo-simple-select-helper-label"
        id="demo-simple-select-helper"
        value={fb_ori_str}
        onChange={handleFBOri}
      >
        <MenuItem value={"x2y,"}>x2y on White/Yellow</MenuItem>
        <MenuItem value={"x2y,x"}>x2y on Blue/Green</MenuItem>
        <MenuItem value={"x2y,z"}>x2y on Red/Orange</MenuItem>
        <MenuItem value={"cn,"}>Color Neutral</MenuItem>
      </Select>
      <FormHelperText></FormHelperText>
    </FormControl>
    <FormControl className={classes.formControl}>
      <InputLabel id="demo-simple-select-helper-label">Display Mode</InputLabel>
      <Select
        labelId="demo-simple-select-helper-label"
        id="demo-simple-select-helper"
        value={display_mode_str}
        onChange={handle_display_mode}
      >
        <MenuItem value={"foreach"}>Per orientation</MenuItem>
        <MenuItem value={"combined"}>Combined </MenuItem>
      </Select>
      <FormHelperText></FormHelperText>
    </FormControl>
    <FormControl className={classes.formControl}>
      <InputLabel id="demo-simple-select-helper-label"># Solutions</InputLabel>
      <Select
        labelId="demo-simple-select-helper-label"
        id="demo-simple-select-helper"
        value={state.num_solution}
        onChange={handle_num_solution}
      >
        <MenuItem value={1}>1</MenuItem>
        <MenuItem value={3}>3 </MenuItem>
        <MenuItem value={5}>5</MenuItem>
        <MenuItem value={10}>10 </MenuItem>
        <MenuItem value={25}>25 </MenuItem>
      </Select>
      <FormHelperText></FormHelperText>
    </FormControl>

  </Box>)
}


function SolutionInputView(props: { state: AnalyzerState, setState: (newState: AnalyzerState) => void}) {
  let classes = useStyles()
  let [editing, setEditing] = React.useState(false)
  let [value, setValue] = React.useState("")
  let textField = React.useRef<HTMLInputElement | null>(null)
  let container = React.useRef<HTMLInputElement | null>(null)
  let editButton = React.useRef<HTMLElement | null>(null)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value)
      event.stopPropagation()
  }
  const toggleEdit = () => {
      setEditing(true)
  }
  const handleClose = () => {
    setEditing(false)
    let t = Date.now()
    let full_solution = analyze_roux_solve(new CubieCube().apply(props.state.scramble), new MoveSeq(value))
    if (full_solution.length > 1 || full_solution.length === 1 && full_solution[0].solution.moves.length > 0 )
      props.setState({...props.state, full_solution})
  }
  const onEntered = () => {
      textField.current && textField.current.focus()
  }
  return <Box>
    <Box >
          <Button variant={editing ? "contained" : "outlined"}
              color="primary"
              size="small"
              onClick={toggleEdit}
              
              startIcon={<EditIcon />}
          >
              {"Input Your Solution"}
          </Button>
    </Box>

    <Dialog open={editing} 
            onClose={handleClose}  
            onEntered={onEntered}
            maxWidth="sm"
            fullWidth
            >
          <DialogTitle> Input your own solution </DialogTitle>
          <DialogContent>
                <TextField
                    inputRef={textField}
                    multiline
                    size="medium"
                    fullWidth
                    rowsMax={10}
                    rows={5}
                    value={value}
                    onChange={onChange}
                    variant="outlined">
                </TextField>
          </DialogContent>
          <DialogActions>
              <Box padding={1}>
              <Button onClick={handleClose} color="primary" variant="outlined" fullWidth >
                  Confirm
              </Button>
              </Box>
          </DialogActions>
    </Dialog>
  </Box>
}



function StageSolutionView(props: { solution: SolutionDesc }) {
  let { solution, stage, premove, orientation } = props.solution
  let getTags = () => {
    if (stage === "fb") {
      return [ orientation ]
    } else if (stage === "ss-front" || stage === "ss-back"){
      return [ stage ]
    } else return []
  }
  let tags = getTags()
  return (
    <Box style={{display: "flex", marginBottom: "2px"}}>
      {tags.filter(x=>x).map( (t, i) => <Chip variant="outlined" size="small" color="primary" label={t} key={i} />) }
      <Box style={{marginLeft: 5}}>
        <Typography>
          {premove + " " + solution.moves.map(m => m.name).join(" ")}
        </Typography>
      </Box>
    </Box>
  )
}



function StageSolutionListView(props: { solutions: SolutionDesc[], state: AnalyzerState, setState: (newState: AnalyzerState) => void} ) {
  let { solutions, state, setState } = props


  return (
    <Box lineHeight={1}>

                
      
      { solutions.map( (s, i) => <StageSolutionView solution={s} key={i}/>) }
    </Box>
  )
  
}



function FullSolutionView(props: { state: AnalyzerState, setState: (newState: AnalyzerState) => void} ) {
  let { state, setState } = props
  let classes = useStyles()

  let setStage = (i: number) => () => {
    setState({...state, 
      stage: state.full_solution[i].stage,
      post_scramble: state.full_solution.slice(0, i).map(x => x.premove + x.solution.toString()).join(" ")
    })
  }
  let [show, setShow] = React.useState(-1)
  let stageView = (sol: SolutionDesc, i: number) => {
    return (
      <Box display="flex" key={i} className={classes.stage} 
        onMouseLeave={ () => setShow(-1)} onMouseEnter={() => setShow(i)} onClick={() => setShow(show === i ? -1 : i)}>

        <Button variant={"text"}
              color="primary"
              size="small"
              onClick={setStage(i)}
              style={{fontSize: "0.7rem", marginLeft: 5, border: (show === i) ? "1px solid" : "1px solid rgba(0, 0,0,0)"
            }} >
        <Typography variant="subtitle1" className={classes.stageText}>{sol.solution.toString()} // {sol.stage}
        </Typography>        

    

        <SearchIcon fontSize="small"/>

        </Button>

      </Box>
    )
  }
  return (
    <Box paddingBottom={2} lineHeight={1} >
      <Box>
        <SolutionInputView state={state} setState={setState}/>
      </Box>
      <Box style={{fontFamily: "Public Sans"}}>
        { props.state.full_solution.map( (desc, i) => stageView(desc, i))}
      </Box>
    </Box>
  )
  
}


const worker_raw = new Worker()
const worker = Comlink.wrap(worker_raw)

function AnalyzerView(props: { state: AppState, dispatch: React.Dispatch<Action> } ) {
    let { state: appState, dispatch: appDispatch } = props
    
    const theme = useTheme()
    const simBackground = getActiveName(appState.config.theme) === "bright" ? "#eeeeef" : theme.palette.background.paper
    let [ state, setState ] = React.useState(initialState)

    let [ solutions, setSolutions ] = React.useState<SolutionDesc[]>([])

    let classes = useStyles()

    let mask = Mask.solved_mask
    let cubieCube = new CubieCube().apply(state.scramble).apply(state.post_scramble)
    let faceletCube = FaceletCube.from_cubie(cubieCube, mask)

    let ycube = FaceletCube.from_cubie(cubieCube.changeBasis(new MoveSeq("y")))


    let solutions_to_display = solutions.slice()
    if (state.show_mode === "combined") {
      solutions_to_display = solutions_to_display.sort( (x, y) => x.score - y.score).slice(0, state.num_solution)
    } else {
     /// solutions_to_display = solutions.slice(0, Math.ceil(config.num_solution / oris.length))
    }
    React.useEffect(() => {
      async function effect() {

        let t = Date.now()
        let curr_solutions = await (worker as any).analyze(state) as SolutionDesc[]
        // console.log("web worker finished after " + (Date.now() - t) + " ms")
        //console.log("result = ", curr_solutions)

        setSolutions(curr_solutions)
        //l/et curr_solutions = await analyzer_worker(state, cubieCube)
        //
      }
      effect()
    }, [state.scramble, state.stage, state.post_scramble, state.num_solution, state.orientation, state.pre_orientation])

    return (
    <Box className={classes.container}>
      <Paper className={classes.paper} elevation={1}>
        <ScrambleView state={state} setState={setState}/>
      </Paper>


      <Paper className={classes.paper} elevation={2}>
        <ConfigView state={state} setState={setState}/>
      </Paper>

      <Paper className={classes.paper2} elevation={1}>
        <Box display="flex" >
          {
            state.full_solution.length >= 1 ? <>
              <Box style={{display: "flex", flexDirection: "column", alignSelf: "flex-start"}}> 
                <Box className={classes.title} style={{}}>
                  My Solution
                </Box> 
              </Box>
              <Box style={{}} className={classes.fgap} /> 
            </>
          : null
          }

          <FullSolutionView state={state} setState={setState}/>
        </Box>

      </Paper>

      <Paper className={ classes.paper}>
      <Grid container>
        <Grid item md={8} xs={12} sm={6} className={classes.condGap}>
          <Box style={{display: "flex" }}>
            <Box display="flex" >
                <Box style={{display: "flex", flexDirection: "column", alignSelf: "flex-start"}}> 
                  <Box className={classes.title} style={{}}>
                    Solutions
                  </Box> 
                  <Box>
                  <Button className={classes.title1} size="small" variant="outlined" color="primary">
                    { state.stage }
                  </Button>
                  </Box>
                </Box>
            </Box>
            <Box style={{}} className={classes.fgap} />
           
              <StageSolutionListView solutions={solutions_to_display} state={state} setState={setState}/>
           
          </Box>
        </Grid>


        <Grid item md={4} sm={6} xs={12} style={{display: "flex", justifyContent: "center"}}>
          <Box style={{backgroundColor: "rgba(0, 0, 0, 0)"}}>
            <CubeSim
              width={250}
              height={250}
              cube={faceletCube}
              colorScheme={appState.colorScheme.getColorsForOri(appState.cube.ori)}
              hintDistance={ 5 }
              bgColor={simBackground}
              facesToReveal={ [Face.L, Face.B, Face.D]  }
            />
          </Box>


        </Grid>
      </Grid>
      </Paper>



      <Box height={20}/>
      <Divider/>
      <Box height={20}/>


    </Box>
    );
}


export default AnalyzerView


