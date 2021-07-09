import React, { Fragment } from 'react'

import CubeSim from './CubeSim'
import { Button, makeStyles, Typography, useTheme, FormControl, FormLabel, } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';

import FavoriteIcon from '@material-ui/icons/Favorite';
import CheckIcon from '@material-ui/icons/Check';

import { FaceletCube, Mask, MoveSeq } from '../lib/CubeLib';

import { AppState,  Action, Config, FavCase, Mode} from "../Types";
import 'typeface-roboto-mono';
import { Face } from '../lib/Defs';

import { SingleSelect, MultiSelect } from './SelectorViews';
import { ColorPanel } from './Input';
import { AlgDesc } from '../lib/Algs';
import { ScrambleInputView } from './ScrambleInputView';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { config } from 'process';

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
    sourceIcon : {
        color: theme.palette.text.hint,
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
  }))


function getMask(state: AppState) : Mask {
    if (state.mode === "fbdr") {
      const fbOnly = (state.case.desc.length === 0 || state.case.desc[0].kind === "fb")
      //   getActiveName(state.config.fbOnlySelector) === "FB Last Pair"
      return fbOnly ? Mask.fb_mask : Mask.fbdr_mask
    }
    else if (state.mode === "fs") {
      let name = state.config.fsSelector.getActiveName()
      return ({
        "Front FS": Mask.fs_front_mask,
        "Back FS": Mask.fs_back_mask,
        "Both": Mask.fb_mask
      } as any)[name]
    }
    else if (state.mode === "ss") {
      if (state.case.desc.length === 0) return Mask.sb_mask
      if (state.case.desc[0].kind === "ss-front")
        return Mask.ss_front_mask
      else
        return Mask.ss_back_mask
    }
    else if (state.mode === "fb") {
      if (state.case.desc.length === 0 || state.case.desc[0].kind === "fb") {
        return Mask.fb_mask
      }
      else if (state.case.desc[0].kind === "fbdr") {
        return Mask.fbdr_mask
      } else {
        return Mask.solved_mask
      }
    }
    else if (state.mode === "4c" || state.mode === "eopair") {
      return Mask.solved_mask
    }
    else return Mask.sb_mask
}

function getHelperTextForMode(mode: Mode) {
  if (mode === "4c" || mode === "eopair") {
    return ("Usage: Press space for next case. Enter to redo."
      + "\n\nVirtual Cube: I/K (E/D) for M'/M, J/F for U/U'")
  } else {
    return null
  }
}


function BlockTrainerView(props: { state: AppState, dispatch: React.Dispatch<Action> } ) {
    let { state, dispatch } = props
    let cube = state.cube.state
    let classes = useStyles()

    let facelet = FaceletCube.from_cubie(cube, getMask(state))

    let desc : AlgDesc[] = state.case.desc.length ? state.case.desc :
       [ { algs: [""], setup:"Press next for new case", id: "", kind: ""} ]

    let spaceButtonText = (state.name === "hiding") ? "Reveal" : "Next"


    let describe_reveal = function(algs: AlgDesc[]) {
      let get_algs = (d: AlgDesc) => d.algs;
      if (algs.length === 1) {
        return get_algs(algs[0]).join("\n")
      } else {
        return algs.map( alg =>
          `[${alg.kind}]:\n` + get_algs(alg).join("\n") + "\n"
        )
      }
    }

    let describe_hide = (desc: AlgDesc[]) => {
      let minMove = desc.map( d =>
        d.algs.map(a => new MoveSeq(a).remove_setup().moves.length))
        .flat()
        .reduce( (a, b) => Math.min(a, b), 100 )
      return `(Min = ${minMove} STM)`
    }
    let algText = (state.name === "hiding") ? describe_hide(desc)
      : (state.name === "revealed") ? describe_reveal(desc) : ""

    const handleSpace = () => {
      dispatch({type: "key", content: "#space"})
      if (spaceButtonText === "Next") {
        setFav(false)
      }
    }


    const [inputActive, setInputActive] = React.useState(false)
    const handleInput = () => {
      setInputActive(true)
    }
    const setup = desc.length ? desc[0].setup! : ""


    const theme = useTheme()
    const simBackground = state.config.theme.getActiveName() === "bright" ? "#eeeeef" : theme.palette.background.paper

    // source
    // Add event listeners
    React.useEffect(() => {
      function downHandler(event: KeyboardEvent) {
        if (event.key === " " && spaceButtonText === "Next") {
          setFav(false)
        }
        state.keyMapping.handle(event, dispatch);
      }
      window.addEventListener('keydown', downHandler);
      return () => {
        window.removeEventListener('keydown', downHandler);
      };
    });


    const [favSelected, setFav] = React.useState(false)
    const handleFav = () => {
      if (state.case.desc.length === 0) return
      const case_ : FavCase = {
        mode: state.mode,
        solver: state.case.desc.map(x => x.kind),
        setup: setup || ""
      }
      if (!favSelected){
        setFav(true)
        dispatch({type: "favList", content: [ case_ ], action: "add"})
      } else {
        setFav(false)
        dispatch({type: "favList", content: [ case_ ], action: "remove" })
      }
    }

    const gt_sm = useMediaQuery(theme.breakpoints.up('sm'));
    const canvas_wh = (gt_sm) ? [400, 350] : [320, 280]

    // helper-text
    let helperText = getHelperTextForMode(state.mode)

                // <Checkbox  className={classes.sourceIconWrap}
            //       icon={<FavoriteIcon />}
            //       checked={favSelected}
            //       onChange = {handleFav}
            //       checkedIcon={<FavoriteIcon color="primary" />}
            //       name="fav" />

    return (
    <Box className={classes.container}>
      <Paper className={classes.paper} elevation={1}>
        <Box style={{display: "flex"}}>
          <Box style={{display: "flex", alignItems: "center"}}> <Box className={classes.title} style={{}}>
            Scramble
          </Box> </Box>
          <Box style={{}} className={classes.fgap} />
          <Box style={{display: "flex", alignItems: "center", flexGrow: 1}}>
          <Typography className={classes.setup} >
                {setup}
          </Typography>
             
          </Box>
          <Box style={{}} className={classes.fgap} />

          <Box style={{display: "flex", flexWrap: "wrap", padding: 0}}>
            <ScrambleInputView display = {setup}
                dispatch={dispatch} scrambles={state.scrambleInput}/>

            <Box>
            <Button variant={favSelected ? "contained" : "outlined"}
                color="primary"
                size="small"
                name="fav"
                onClick={handleFav}
                startIcon={<FavoriteIcon />} 
                endIcon={favSelected ? null : null}
                >
                {favSelected ? "✓" : "ADD"}
            </Button></Box>
          </Box>
          
        </Box>
      </Paper>

      <Paper className={ classes.paper}>
      <Grid container>

        <Grid item md={6} sm={12} xs={12} className={classes.condGap}>
          <Box style={{display: "flex" }}>
            <Box display="flex" >
                <Box style={{display: "flex", alignSelf: "flex-start"}}> <Box className={classes.title} style={{}}>
                  Solutions
                </Box> </Box>
            </Box>
            <Box style={{}} className={classes.fgap} />
            <div>
              <Box paddingBottom={2} lineHeight={1}>
                <Typography style={{whiteSpace: 'pre-line', fontSize: 16}} >
                  {algText}
                </Typography>
              </Box>
            </div>
          </Box>
        </Grid>


        <Grid item md={6} sm={12} xs={12} style={{display: "flex", justifyContent: "center"}}>
          <Box style={{backgroundColor: "rgba(0, 0, 0, 0)"}}>
            { props.state.config.showCube.getActiveName() === "Show" ?
            <CubeSim
              width={canvas_wh[0]}
              height={canvas_wh[1]}
              cube={facelet}

              colorScheme={state.colorScheme.getColorsForOri(state.cube.ori)}
              hintDistance={ (state.mode === "4c" || state.mode === "eopair") ? 3 : 7 }
              theme={state.config.theme.getActiveName()}
              facesToReveal={ [Face.L, Face.B, Face.D]  }
            /> : null }
          </Box>
        </Grid>
      </Grid>
      </Paper>

      <Paper className={classes.paper} elevation={2}>

      <Grid container spacing={0}>
        <Grid item xs={5} sm={4} md={3}>
          <Button onFocus={(evt) => evt.target.blur() } className={classes.button} size="medium" variant="contained" color="primary" onClick={handleSpace}>
              {spaceButtonText}
          </Button>
        </Grid>

      </Grid>

      </Paper>

      <Box height={20}/>
      <Divider/>
      <Box height={20}/>

      <ConfigPanelGroup {...{state, dispatch} } />

      {helperText ?
      <Fragment>
        <Box height={20}/>
          <Divider/>
        <Box height={15}/>
        <Box>
        <FormControl component="fieldset" className={classes.prompt}>
          <FormLabel component="legend">
            <pre style={{ fontFamily: 'inherit' }}>
              {helperText}
            </pre>
          </FormLabel>
          </FormControl>
        </Box>
      </Fragment> : null }
    </Box>
    );
}



function ConfigPanelGroup(props: {state: AppState, dispatch: React.Dispatch<Action> }) {
  let { state, dispatch } = props
  if (state.mode === "ss") {
    let DRManip = [
      // names: ["UF", "FU", "UL", "LU", "UB", "BU", "UR", "RU", "DF", "FD", "DB", "BD",
      // "DR", "RD", "BR", "RB", "FR", "RF"],
      { name: "Toggle Select All", enableIdx: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17] },
      { name: "Toggle All Oriented", enableIdx: [0, 2, 4, 6, 8, 10, 12, 14, 16] },
    ]
    return (
      <Fragment>

      <SingleSelect {...{state, dispatch, select: "ssSelector"}}> </SingleSelect>
      <SingleSelect {...{state, dispatch, select: "ssPairOnlySelector"}}> </SingleSelect>
      <SingleSelect {...{state, dispatch, select: "solutionNumSelector"}}> </SingleSelect>
      
      <SingleSelect {...{state, dispatch, select: "showCube"}}> </SingleSelect>
      <MultiSelect {...{state, dispatch, select: "ssPosSelector", options: {manipulators: DRManip} }}> </MultiSelect>
      <ColorPanel {...{state, dispatch}} />

      </Fragment>
    )
  } else if (state.mode === "fbdr") {
    let select1 = "fbdrSelector"
    let select2 = "fbOnlySelector"
    let select3 = "fbPairSolvedSelector"
    let select4 = "fbdrScrambleSelector"
    let select5 = "solutionNumSelector"

    let LPEdgeManip = [
      { name: "Toggle Select All", enableIdx: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17] },
    ]
    let pos1 = "fbdrPosSelector1"
    let pos3 = "fbdrPosSelector3"

    return (
      <Fragment>
      <SingleSelect {...{state, dispatch, select: select2}}> </SingleSelect>
      <SingleSelect {...{state, dispatch, select: select1}}> </SingleSelect>
      <SingleSelect {...{state, dispatch, select: select3}}> </SingleSelect>
      <SingleSelect {...{state, dispatch, select: select4}}> </SingleSelect>
      <SingleSelect {...{state, dispatch, select: select5}}> </SingleSelect>
      <SingleSelect {...{state, dispatch, select: "showCube"}}> </SingleSelect>

      <MultiSelect {...{state, dispatch, select: pos1, options: {manipulators: LPEdgeManip} }}> </MultiSelect>
      <MultiSelect {...{state, dispatch, select: pos3, options: {manipulators: LPEdgeManip} }}> </MultiSelect>
      <ColorPanel {...{state, dispatch}} />

      </Fragment>
    )
  } else if (state.mode === "fb") {
    let select1 = "fbPieceSolvedSelector"
    let select2 = "solutionNumSelector"

    return (
      <Fragment>
        <SingleSelect {...{ state, dispatch, select: select1 }}> </SingleSelect>
        <SingleSelect {...{ state, dispatch, select: select2 }}> </SingleSelect>
        <SingleSelect {...{state, dispatch, select: "showCube"}}> </SingleSelect>

        <ColorPanel {...{state, dispatch}} />


      </Fragment>
    )
   } else if (state.mode === "fs") {
    let select1 = "fsSelector"
    let select2 = "solutionNumSelector"

    return (
      <Fragment>
        <SingleSelect {...{ state, dispatch, select: select1 }}> </SingleSelect>
        <SingleSelect {...{ state, dispatch, select: select2 }}> </SingleSelect>
        <SingleSelect {...{state, dispatch, select: "showCube" }}> </SingleSelect>

        <ColorPanel {...{state, dispatch}} />


      </Fragment>
    )
   } else if (state.mode === "fbss") {
    let select1 = "fbssLpSelector"
    let select2 = "fbssSsSelector"
    let select3 = "solutionNumSelector"

    return (
      <Fragment>
        <SingleSelect {...{ state, dispatch, select: select1 }}> </SingleSelect>
        <SingleSelect {...{ state, dispatch, select: select2 }}> </SingleSelect>
        <SingleSelect {...{ state, dispatch, select: select3 }}> </SingleSelect>
        <ColorPanel {...{state, dispatch}} />


      </Fragment>
    )
   }
   else if (state.mode === "4c"){
    let select1 = "lseStageSelector"
    let select2 = "lseMCSelector"
    let select3 = "lseBarSelector"
    let select4 = "solutionNumSelector"

    return (
      <Fragment>
        <SingleSelect {...{ state, dispatch, select: select1 }}> </SingleSelect>
        <SingleSelect {...{ state, dispatch, select: select2 }}> </SingleSelect>
        <SingleSelect {...{ state, dispatch, select: select3 }}> </SingleSelect>
        <SingleSelect {...{ state, dispatch, select: select4 }}> </SingleSelect>
        <SingleSelect {...{state, dispatch, select: "showCube"}}> </SingleSelect>

        <ColorPanel {...{state, dispatch}} />
      </Fragment>
    )
   } else if (state.mode === "eopair"){
    let select1 = "lseEOSelector"
    let select2 = "lseEOLRMCSelector"
    let select3 = "lseBarbieSelector"
    let select4 = "lseEOLRScrambleSelector"
    let select5 = "solutionNumSelector"

    return (
      <Fragment>
        <MultiSelect {...{ state, dispatch, select: select1, options: {noDialog: true}} }> </MultiSelect>
        <SingleSelect {...{ state, dispatch, select: select2 }}> </SingleSelect>
        <SingleSelect {...{ state, dispatch, select: select3 }}> </SingleSelect>
        <SingleSelect {...{ state, dispatch, select: select4 }}> </SingleSelect>
        <SingleSelect {...{ state, dispatch, select: select5 }}> </SingleSelect>
        <SingleSelect {...{state, dispatch, select: "showCube"}}> </SingleSelect>

        <ColorPanel {...{state, dispatch}} />
      </Fragment>
    )
   }
   else return <Fragment/>
}



export default BlockTrainerView


