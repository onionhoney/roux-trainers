import React, { Dispatch } from 'react'

import { makeStyles } from '@material-ui/core';
import { Grid, GridList, GridListTile, Paper, Container } from '@material-ui/core';

import { AlgDesc } from "../lib/Algs";
import { AppState, Action } from '../Types';

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
      },
    container: {
        paddingTop: theme.spacing(0),
        paddingBottom: theme.spacing(2),
        backgroundColor: theme.palette.background.default,
      },
    paper: {
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
      },
      gridList: {
        width: 600,
        height: 450,
      },
}))

type VisualCubeConfig = {
    alg: string;
    stage: string;
    sch: string; //yrbwog
}
function VisualCube(props: VisualCubeConfig) {
  let { alg, stage, sch } = props
  const template =
  `http://localhost:8000/visualcube.php?fmt=svg&r=y30x-24&size=150&co=40&fo=100&cc=ccc`
    + `&stage=${stage}&sch=${sch}&case=${alg}`
  return <img src={template} alt=""/>
}

function PanoramaTable(props: {algs: AlgDesc[]}){
    let classes = useStyles()
    let { algs } = props
    return <GridList cellHeight={160} className={classes.gridList} cols={3}>
            {algs.map((alg) => (
                <GridListTile key={alg.id} cols={1}>
                    <VisualCube alg={alg.alg} stage="f2b" sch="yrbwog"/>
                </GridListTile>
            ))}
        </GridList>
}

export default function PanoramaView(props: { state: AppState, dispatch: Dispatch<Action> }) {
    let classes = useStyles()
    let algs : AlgDesc[] = [
        "RUR", "RU'R'"
    ].map( str => ({
        id: str,
        alg: str,
        kind: "sb"
    }))

    return <div className={classes.root}>
        <div>
        <PanoramaTable algs={algs}/>
        </div>
        <div>
        <PanoramaTable algs={algs}/>
        </div>
    </div>
}