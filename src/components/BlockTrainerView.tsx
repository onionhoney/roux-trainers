import React, { Fragment } from 'react'

import CubeSim from './CubeSim'
import { Button, makeStyles, Divider, Typography, useTheme } from '@material-ui/core';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';

import BookmarkIcon from '@material-ui/icons/Bookmark';
import CreateIcon from '@material-ui/icons/Create';
import FavoriteIcon from '@material-ui/icons/Favorite';

import { FaceletCube, CubeUtil, Mask, Move } from '../lib/CubeLib';

import { AppState,  Action, Config, FavCase} from "../Types";
import 'typeface-roboto-mono';
import clsx from 'clsx';
import { Face } from '../lib/Defs';
import { getActiveName } from '../lib/Selector';

import { SingleSelect, MultiSelect } from './Select';

const useStyles = makeStyles(theme => ({
    container: {
      paddingTop: theme.spacing(0),
      paddingBottom: theme.spacing(2),
      backgroundColor: theme.palette.background.default,
    },
    button: {
      width: "100%",
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
        fontSize: 18,
        padding: 0
    },
    sourceIconWrap : {
        height: 32,
    },
    fab: {
      position: 'absolute',
      top: theme.spacing(7),
      left: theme.spacing(2),
    },
  }))


function getMask(state: AppState) : Mask {
    if (state.mode === "fbdr") {
      const fbOnly = (state.case.desc.length === 0 || state.case.desc[0].kind === "fb")
      //   getActiveName(state.config.fbOnlySelector) === "FB Last Pair"
      return fbOnly ? Mask.fb_mask : Mask.fbdr_mask
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
    else return Mask.sb_mask
}

function BlockTrainerView(props: { state: AppState, dispatch: React.Dispatch<Action> } ) {
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
      if (spaceButtonText === "Next") {
        setFav(false)
      }
    }

    const theme = useTheme()
    const simBackground = getActiveName(state.config.theme) === "bright" ? "#eeeeef" : theme.palette.background.paper

    // source
    const sourceSelected = state.scrSource === "input"
    const handleSource = (evt: any) => {
      if (sourceSelected)
        dispatch({type: "scrSource", content: "random"})
      else
        dispatch({type: "scrSource", content: "input"})
    }
    const [favSelected, setFav] = React.useState(false)
    const handleFav = () => {
      if (state.case.desc.length === 0) return
      const case_ : FavCase = {
        mode: state.mode,
        solver: state.case.desc[0].kind,
        setup: state.case.desc[0].setup!
      }
      if (!favSelected){
        setFav(true)
        dispatch({type: "favList", content: [ case_ ], action: "add"})
      } else {
        setFav(false)
        dispatch({type: "favList", content: [ case_ ], action: "remove" })
      }
    }

    return (
    <Box className={classes.container}>

      <Grid container>
        <Grid item xs={12}>
        <Paper className={ clsx(classes.canvasPaper, classes.fixedHeight) }>
          <Box margin="auto">
            <CubeSim
              width={250}
              height={250}
              cube={facelet}
              colorScheme={CubeUtil.ori_to_color_scheme(props.state.cube.ori)}
              bgColor={simBackground}
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
              <Box>
              <Box className={classes.title} >
                Scramble
              </Box> </Box>
            <Box flexGrow={0.2}></Box>
            <Box >
            {/* <Checkbox  className={classes.sourceIconWrap}
              icon={<CreateIcon />}
              checked={sourceSelected}
              onChange = {handleSource}
              checkedIcon={<CreateIcon color="primary" />}
              name="source" /> */}

            <Checkbox  className={classes.sourceIconWrap}
              icon={<FavoriteIcon />}
              checked={favSelected}
              onChange = {handleFav}
              checkedIcon={<FavoriteIcon color="primary" />}
              name="fav" />

            </Box>

            </Box>

          </Grid>

          <Grid item xs={12}  >
            <Box paddingBottom={1} lineHeight={1} className={classes.textColumn}>
            <Typography style={{whiteSpace: 'pre-line', fontSize: 20, fontWeight: 400}}>
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
                <Box className={classes.title} >
                  Solution
                </Box>
            </Box>
          </Grid>

          <Grid item xs={12} className={classes.textColumn} >
            <Box paddingBottom={2} lineHeight={1}>
              <Typography style={{whiteSpace: 'pre-line', fontSize: 16}} >
                {algText}
              </Typography>
            </Box>

          </Grid>
        </Grid>
        </Grid>

      </Grid>

      <Grid container spacing={0}>
        <Grid item xs={4} sm={4} md={3}>
          <Button onFocus={(evt) => evt.target.blur() } className={classes.button} size="medium" variant="contained" color="primary" onClick={handleSpace}> { /* className={classes.margin}>  */ }
              {spaceButtonText}
          </Button>
        </Grid>
      </Grid>

      </Paper>

      <Box height={20}/>
      <Divider/>
      <Box height={20}/>

      <ConfigPanelGroup {...{state, dispatch} } />
    </Box>
    );
}



function ConfigPanelGroup(props: {state: AppState, dispatch: React.Dispatch<Action> }) {
  let { state, dispatch } = props
  if (state.mode === "ss") {
    let select1 = (config: Config) => { return config.ssSelector }
    let select5 = (config: Config) => { return config.ssEOSelector }
    let select2 = (config: Config) => { return config.ssPairOnlySelector }
    let select3 = (config: Config) => { return config.solutionNumSelector }
    let select4 = (config: Config) => { return config.orientationSelector }
    return (
      <Fragment>
      <SingleSelect {...{state, dispatch, select: select1}}> </SingleSelect>
      <SingleSelect {...{state, dispatch, select: select5}}> </SingleSelect>
      <SingleSelect {...{state, dispatch, select: select2}}> </SingleSelect>
      <SingleSelect {...{state, dispatch, select: select3}}> </SingleSelect>
      <MultiSelect {...{state, dispatch, select: select4}}> </MultiSelect>
      </Fragment>
    )
  } else if (state.mode === "fbdr") {
    let select1 = (config: Config) => { return config.fbdrSelector }
    let select2 = (config: Config) => { return config.fbOnlySelector }
    let select3 = (config: Config) => { return config.fbPairSolvedSelector }
    let select6 = (config: Config) => { return config.fbdrScrambleSelector }
    let select4 = (config: Config) => { return config.solutionNumSelector }
    let select5 = (config: Config) => { return config.orientationSelector }
    return (
      <Fragment>
      <SingleSelect {...{state, dispatch, select: select1}}> </SingleSelect>
      <SingleSelect {...{state, dispatch, select: select2}}> </SingleSelect>
      <SingleSelect {...{state, dispatch, select: select3}}> </SingleSelect>
      <SingleSelect {...{state, dispatch, select: select6}}> </SingleSelect>
      <SingleSelect {...{state, dispatch, select: select4}}> </SingleSelect>
      <MultiSelect {...{state, dispatch, select: select5}}> </MultiSelect>
      </Fragment>
    )
  } else if (state.mode === "fb") {
    let select3 = (config: Config) => { return config.fbPieceSolvedSelector }
    let select4 = (config: Config) => { return config.solutionNumSelector }
    let select5 = (config: Config) => { return config.orientationSelector }

    return (
      <Fragment>
        <SingleSelect {...{ state, dispatch, select: select3 }}> </SingleSelect>
        <SingleSelect {...{ state, dispatch, select: select4 }}> </SingleSelect>
        <MultiSelect {...{ state, dispatch, select: select5 }}> </MultiSelect>
      </Fragment>
    )
   } else return <Fragment/>
}



export default BlockTrainerView


