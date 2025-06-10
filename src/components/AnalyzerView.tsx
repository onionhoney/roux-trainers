import React, { Fragment } from 'react'

import CubeSim from './CubeSim'
import { Button, Typography, useTheme, FormControl } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import Divider from '@mui/material/Divider';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

import { CubeUtil, CubieCube, FaceletCube, Mask, MoveSeq } from '../lib/CubeLib';

import { AppState, Action} from "../Types";
import 'typeface-roboto-mono';
import { Face, Typ } from '../lib/Defs';

import { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';

import { AnalyzerState, SolutionDesc, initialState, analyze_roux_solve, fbStageT } from '../lib/Analyzer';

import { useAnalyzer } from "../lib/Hooks";

import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';

import Chip from '@mui/material/Chip';
import { CachedSolver } from '../lib/CachedSolver';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import EditIcon from '@mui/icons-material/Edit';

import SearchIcon from '@mui/icons-material/Search';
import useMediaQuery from '@mui/material/useMediaQuery';

import { ColorScheme } from '../lib/CubeLib';

const useStyles = makeStyles(theme => ({
    container: {
      paddingTop: theme.spacing(0),
      paddingBottom: theme.spacing(0),
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
      [theme.breakpoints.down('sm')]: {
      fontSize: "1.0rem",
      fontWeight: 500
      },
  },
    condGap: {
    },
    fgap: {
      flexShrink: 100, flexBasis: "1.5rem", minWidth: "1.5em",
      [theme.breakpoints.down('sm')]: {
        flexBasis: "1.0rem",
        minWidth: "0.4rem"
      }
    },
    fixedHeight: {
      height: 250,
    },
    title : {
        color: theme.palette.text.disabled,
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
    configItem: {
      paddingRight: 15
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
        //border: "1px solid " + theme.palette.text.disabled,
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
      margin: theme.spacing(0),
      minWidth: 80,
      maxWidth: 160,
    },
    menu: {
        '& .MuiMenuItem-root': {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
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
    const theme = useTheme()
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
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

      <Box style={{display: "flex", alignItems: "center", flexGrow: 1}}>
        <TextField
          size="medium"
          fullWidth
          multiline
          maxRows={3}
          label={"Scramble"}
          value={value}
          onChange={onScrambleChange}
          variant="filled"
          inputProps={{
            sx: {fontSize: "1.2rem", fontWeight: 500}
          }}
        />
      </Box>
      <Box style={{}} className={classes.fgap} />
      <Box sx={{ display: 'flex', flexDirection: isSmallScreen ? 'column' : 'row', gap: isSmallScreen ? 0.5 : 0.5, alignItems: 'stretch' }}>
        <Button onFocus={(evt) => evt.target.blur() } onClick={handleGen}
              size="medium" variant="contained" color="primary" >
                Gen
        </Button>
        <Button onFocus={(evt) => evt.target.blur() } onClick={handleBegin}
              size="medium" variant="contained" color="primary" >
                GO
        </Button>
      </Box>
    </Box> )
}

function ConfigView(props: { state: AnalyzerState, setState: (newState: AnalyzerState) => void}) {
  let { state, setState } = props
  let classes = useStyles()

  const menuProps = {
    PaperProps: {
        style: {
            maxWidth: 160,
        },
    },
    className: classes.menu
  };

  const selectSx = { fontSize: "1.0rem" };

  let fb_ori_str = state.orientation + "," + state.pre_orientation
  let handleFBOri = (event: SelectChangeEvent<String>) => {
    let value: string[]= (event.target.value).split(",")
    setState({...state, orientation: value[0], pre_orientation: value[1]})
  }
  let display_mode_str = state.show_mode
  let handle_display_mode = (event: SelectChangeEvent<String>) =>  {
    let value = (event.target.value as string)
    setState({...state, show_mode: value})
  }
  let handle_num_solution = (event: SelectChangeEvent<number>) =>  {
    let value = Number.parseInt(event.target.value as string)
    setState({...state, num_solution: value || state.num_solution})
  }
  let handle_fb_stage = (event: SelectChangeEvent<fbStageT>) =>  {
    let value = (event.target.value as fbStageT)
    setState({...state, fb_stage: value})
  }
  let handle_hide_solutions = (event: SelectChangeEvent<String>) =>  {
    let value = (event.target.value as string)
    setState({...state, hide_solutions: value === "true"})
  }
  return (
  <Box display="flex" flexWrap="wrap" gap={0} sx={{ rowGap: 2}}>
    <Box className={classes.configItem}>
      <FormControl className={classes.formControl}>
        <InputLabel id="demo-simple-select-helper-label">FB Orientation</InputLabel>
        <Select
          labelId="demo-simple-select-helper-label"
          id="demo-simple-select-helper"
          value={fb_ori_str}
          onChange={handleFBOri}
          MenuProps={menuProps}
          sx={selectSx}
        >
          <MenuItem value={"x2y,"}>x2y on W/Y</MenuItem>
          <MenuItem value={"x2y,x"}>x2y on B/G</MenuItem>
          <MenuItem value={"x2y,z"}>x2y on R/O</MenuItem>
          <MenuItem value={"cn,"}>Color Neutral</MenuItem>
        </Select>
        <FormHelperText></FormHelperText>
      </FormControl>
    </Box>
    <Box className={classes.configItem}>
      <FormControl className={classes.formControl}>
      <InputLabel id="demo-simple-select-helper-label">Organize</InputLabel>
      <Select
        labelId="demo-simple-select-helper-label"
        id="demo-simple-select-helper"
        value={display_mode_str}
        onChange={handle_display_mode}
        MenuProps={menuProps}
        sx={selectSx}
      >
        <MenuItem value={"foreach"}>By FB</MenuItem>
        <MenuItem value={"combined"}>Combined </MenuItem>
      </Select>
      <FormHelperText></FormHelperText>
     </FormControl>
    </Box>
    <Box  className={classes.configItem}>
    <FormControl className={classes.formControl}>
      <InputLabel id="demo-simple-select-helper-label"># Solutions</InputLabel>
      <Select
        labelId="demo-simple-select-helper-label"
        id="demo-simple-select-helper"
        value={state.num_solution}
        onChange={handle_num_solution}
        MenuProps={menuProps}
        sx={selectSx}
      >
        <MenuItem value={1}>1</MenuItem>
        <MenuItem value={3}>3 </MenuItem>
        <MenuItem value={5}>5</MenuItem>
        <MenuItem value={10}>10 </MenuItem>
        <MenuItem value={25}>25 </MenuItem>
      </Select>
      <FormHelperText></FormHelperText>
    </FormControl>
    </Box>
    <Box  className={classes.configItem}>
    <FormControl className={classes.formControl}>
      <InputLabel id="demo-simple-select-helper-label">FB Stage</InputLabel>
      <Select
        labelId="demo-simple-select-helper-label"
        id="demo-simple-select-helper"
        value={state.fb_stage}
        onChange={handle_fb_stage}
        MenuProps={menuProps}
        sx={selectSx}
      >
        <MenuItem value={"fb"}>FB</MenuItem>
        <MenuItem value={"fs"}>FS</MenuItem>
        <MenuItem value={"pseudo-fs"}>Pseudo FS</MenuItem>
        <MenuItem value={"felinep1"}>E-Line+1</MenuItem>
        <MenuItem value={"fs-combo"}>FS/Line</MenuItem>
      </Select>
      <FormHelperText></FormHelperText>
    </FormControl>
    </Box>
    <Box className={classes.configItem}>
      <FormControl className={classes.formControl}>
        <InputLabel id="hide-solutions-label">Hints?</InputLabel>
        <Select
          labelId="hide-solutions-label"
          id="hide-solutions-select"
          value={state.hide_solutions.toString()}
          onChange={handle_hide_solutions}
          MenuProps={menuProps}
          sx={selectSx}
        >
          <MenuItem value={"true"}>Yes</MenuItem>
          <MenuItem value={"false"}>No</MenuItem>
        </Select>
        <FormHelperText></FormHelperText>
      </FormControl>
    </Box>
  </Box>)
}


function SolutionInputView(props: { state: AnalyzerState, setState: (newState: AnalyzerState) => void}) {
  let [editing, setEditing] = React.useState(false)
  let [value, setValue] = React.useState("")
  let textField = React.useRef<HTMLInputElement | null>(null)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value)
      event.stopPropagation()
  }
  const toggleEdit = () => {
      setEditing(true)
  }
  const handleClose = () => {
    setEditing(false)
    let full_solution = analyze_roux_solve(new CubieCube().apply(props.state.scramble), new MoveSeq(value))
    if ( (full_solution.length > 1) || (full_solution.length === 1 && full_solution[0].solution.moves.length > 0)) {
      props.setState({...props.state, full_solution})
    }
  }
  //const onEntered = () => {
  //    textField.current && textField.current.focus()
  //}
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
            /*onEntered={onEntered}*/
            maxWidth="sm"
            fullWidth
            >
          <DialogTitle> Input your reconstructed solution </DialogTitle>
          <DialogContent>
                <TextField
                    inputRef={textField}
                    multiline
                    size="medium"
                    fullWidth
                    maxRows={10}
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


// Generic memoization function
function memoize<T, R>(fn: (arg: T) => R): (arg: T) => R {
    const cache = new Map<string, R>();

    return (arg: T) => {
        const key = String(arg);
        if (cache.has(key)) {
            return cache.get(key)!;
        }

        const result = fn(arg);
        cache.set(key, result);
        return result;
    };
}

// The actual rotation shortening function without caching logic
function _shorten_rotation(rotation: string): string {
    const rotation_inv = new MoveSeq(rotation).inv();
    const cube = new CubieCube().apply(rotation_inv);
    const solution = CachedSolver.get("center").solve(cube, 0, 3, 1)[0];
    return solution.toString();
}

// Create the memoized version
export const get_shortened_rotation = memoize(_shorten_rotation);

// Add this color mapping at the top level
const colorMap : { [key: string]: string } = ColorScheme.default_colors;
/*{ [key: string]: string } = {
  "W": "#FFFFFF",
  "Y": "#FFD500",
  "G": "#00B500",
  "B": "#0000FF",
  "O": "#FF5800",
  "R": "#C41E3A"
};*/

// Add this component for the color squares
function ColorPair({ colors }: { colors: string[] }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.2}}>
      {colors.map((color, i) => (
        <Box
          key={i}
          sx={{
            width: '1.0rem',
            height: '1.1rem',
            backgroundColor: colorMap[color],
            border: '1px solid rgba(0,0,0,0.5)',
            display: 'inline-block'
          }}
        />
      ))}
    </Box>
  );
}

// Modify the _orientation_fb_name function to return colors instead of names
function _orientation_fb_colors(orientation: string): string[] {
    const cube = new CubieCube().apply(orientation)
    const dl_d = FaceletCube.color_of_sticker(cube, [5, 0, Typ.E])
    const dl_l = FaceletCube.color_of_sticker(cube, [5, 1, Typ.E])
    const color_lookup = ["W", "Y", "G", "B", "O", "R"]
    return [color_lookup[dl_d], color_lookup[dl_l]]
}
export const get_orientation_fb_colors = memoize(_orientation_fb_colors);

function StageSolutionView(props: { solution: SolutionDesc, shortestLength?: number }) {
  let { solution, stage, premove, orientation, fb_tag } = props.solution
  let getTags = () => {
    if (stage === "fb") {
      const colors = get_orientation_fb_colors(orientation || "")
      return [<ColorPair key="colors" colors={colors} />, fb_tag].filter(Boolean)
    } else if (stage === "ss-front" || stage === "ss-back"){
      return [ stage ]
    } else return []
  }
  let tags = getTags()
  const isShortest = props.shortestLength !== undefined && solution.moves.length === props.shortestLength
  const shortened_rotation = get_shortened_rotation(orientation + " " + premove)

  return (
    <Box style={{display: "flex", marginBottom: "2px", alignItems: "center"}}>
      {tags.filter(x=>x).map( (t, i) =>
        <Chip variant="outlined" size="small" color="primary" label={t} key={i}
          sx={{ '& .MuiChip-label': { fontSize: '0.9rem', fontWeight: 500, padding: '0 8px',
                                      minWidth: "6ch", textAlign: "center",
                                      display: "flex",
                                      alignItems: "center", justifyContent: "center" } }} />
      )}
      {/* add a little space between the tags and the solution */}
      <Box style={{width: ".5ch"}} />
      <Box style={{marginLeft: 5}}>
        <Typography sx={{fontSize: "1.3rem"}}>
          {shortened_rotation + " " + solution.moves.map(m => m.name).join(" ")}
          {isShortest && " (*)"}
        </Typography>
      </Box>
    </Box>
  )
}


function StageSolutionListView(props: { solutions: SolutionDesc[], num_to_display: number, state: AnalyzerState, setState: (newState: AnalyzerState) => void} ) {
  let { solutions, num_to_display, state } = props
  const [isRevealed, setIsRevealed] = React.useState(!state.hide_solutions)

  // Update isRevealed when hide_solutions changes
  React.useEffect(() => {
    setIsRevealed(!state.hide_solutions)
  }, [state.hide_solutions, solutions])

  // Find the shortest solution by STM length
  const shortestSolution = solutions.length > 0 ?
    solutions.reduce((shortest, current) =>
      current.solution.moves.length < shortest.solution.moves.length ? current : shortest
    ) : null

  // For hints, generate a reader friendly text framing it as a quiz:
  // for each shortest solution, parse the tag into the correspnding DL-edge color (we will build a utility function for this)
  // then for each fb_tag, have a separate line to describe it in the form of "Can you spot the 3-STM ${fb_tag} solution in Blue-White or Green-Red block?"

  //TODO; ordering in per-orientation FS-combo mode
  const handleClick = () => {
    setIsRevealed(true)
  }

  const shortest_length = shortestSolution?.solution.moves.length || 0
  const shortest_solutions = solutions.filter(s => s.solution.moves.length === shortest_length)
  //console.log("shortest solutions", shortest_solutions)
  const tag_full_name : Record<string, string> = {
    "FS": "FS",
    "FB": "FB",
    "Ps": "Pseudo FS",
    "Line": "E-Line + 1c"
  }
  const shortest_solution_tag_names = shortest_solutions.map(s => ({tag: tag_full_name[s.fb_tag || "FB"], fb_name: get_orientation_fb_colors(s.orientation || "")}))
  const shortest_tag_names = shortest_solution_tag_names.reduce((acc, curr) => {
    if (!acc[curr.tag]) { acc[curr.tag] = new Set() }
    acc[curr.tag].add(curr.fb_name.join("-"))
    return acc
  }, {} as Record<string, Set<string>>)
  const shortest_tag_names_str = Object.entries(shortest_tag_names).map(([tag, fb_names]) => {
    const colorPairs = [...fb_names].map(name => {
      const [color1, color2] = name.split("-");
      return <ColorPair key={name} colors={[color1, color2]} />;
    });

    return (
      <React.Fragment key={tag}>
        <Box sx={{ width: "100%", mb: 1 }}>
          <Typography variant="body1" color="text.primary" sx={{ fontSize: "1.1rem", textAlign: "center" }} >
            {`There exists ${shortest_length}-STM ${tag || "solution"} in: `}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.0, justifyContent: "center", mb: 2 }}>
          {colorPairs}
        </Box>
      </React.Fragment>
    );
  })

  return (
    <Box lineHeight={1}>
      {solutions.length > 0 && (
        <Box onClick={!isRevealed ? handleClick : undefined} sx={{ cursor: !isRevealed ? 'pointer' : 'default' }}>
          {!isRevealed ? (
            <Box sx={{ width: "100%" }}>
              {shortest_tag_names_str}
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1, fontSize: "1.0rem", textAlign: "center" }}>
                (Click to reveal)
              </Typography>
            </Box>
          ) : (
            <Box>
              {solutions.slice(0, num_to_display).map((s, i) => (
                <StageSolutionView
                  solution={s}
                  key={i}
                  shortestLength={shortestSolution?.solution.moves.length}
                />
              ))}
            </Box>
          )}
        </Box>
      )}
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
        <Typography variant="subtitle1" className={classes.stageText}>{sol.solution.toString()} "//" {sol.stage}
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

function AnalyzerView(props: { state: AppState, dispatch: React.Dispatch<Action> } ) {
    let { state: appState } = props

    const theme = useTheme()
    let [ state, setState ] = React.useState(initialState)

    let classes = useStyles()

    let mask = Mask.solved_mask
    let cubieCube = new CubieCube().apply(state.scramble).apply(state.post_scramble)
    let faceletCube = FaceletCube.from_cubie(cubieCube, mask)

    const analyzerData = useAnalyzer(state)

    let solutions_to_display = analyzerData.isRunning ? [] : (analyzerData.solutions || [])
    let num_solutions_to_display = solutions_to_display.length

    if (state.show_mode === "combined") {
      solutions_to_display = solutions_to_display.sort( (x, y) => x.score - y.score) //.slice(0, state.num_solution)
      num_solutions_to_display = state.num_solution
    } else {
     /// solutions_to_display = solutions.slice(0, Math.ceil(config.num_solution / oris.length))
    }

    const gt_md = useMediaQuery(theme.breakpoints.up('md'));
    const gt_sm = useMediaQuery(theme.breakpoints.up('sm'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    console.log("isSmallScreen", isSmallScreen, theme.breakpoints)
    const canvas_wh = (gt_md) ? [400, 350] : (gt_sm) ? [400, 350] : [320, 280]

    const configPanel = (
      <Paper className={classes.paper} elevation={2}>
        <ConfigView state={state} setState={setState}/>
      </Paper>
    );
    const inputSolutionPanel = (
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
    )

    return (
    <Box className={classes.container}>
      <Paper className={classes.paper} elevation={1}>
        <ScrambleView state={state} setState={setState}/>
      </Paper>

      {!isSmallScreen && configPanel}
      {/* {!isSmallScreen && inputSolutionPanel} */}

      <Paper className={ classes.paper}>
      <Grid container>
        <Grid item md={6} sm={12} xs={12} className={classes.condGap}>
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
            <Box style={{flexGrow: 1}}>
              <StageSolutionListView solutions={solutions_to_display} num_to_display={num_solutions_to_display} state={state} setState={setState}/>
            </Box>
          </Box>
        </Grid>
        {/* colorScheme=appState.colorScheme.getColorsForOri(appState.cube.ori)} */}
        <Grid item md={6} xs={12} style={{display: "flex", justifyContent: "center"}}>
          <Box style={{backgroundColor: "rgba(0, 0, 0, 0)"}}>
            <CubeSim
              width={canvas_wh[0]}
              height={canvas_wh[1]}
              cube={faceletCube}
              colorScheme={appState.colorScheme.getColorsForOri("WG")}
              hintDistance={ 6 }
              theme={appState.config.theme.getActiveName()}

              facesToReveal={ [Face.L, Face.B, Face.D]  }
            />
          </Box>
        </Grid>
      </Grid>

      {/* <Box height={20}/>
      <Divider/>
      <Box height={20}/> */}
      </Paper>

      {isSmallScreen && configPanel}
      {/* <ColorPanel {...{state: appState, dispatch: appDispatch}} /> */}

    </Box>
    );
}


export default AnalyzerView


