import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import React from 'react'
import CaseVisualizer from './CaseVisualizer'

import { AppState, Action, Config } from "../Types";
import { makeDialog } from './Dialog';
import SRVisualizer from 'sr-visualizer';
import { Button, ButtonGroup, Divider, makeStyles, Typography, useMediaQuery } from '@material-ui/core';
import Selector from '../lib/Selector';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import { theme } from '../theme';

type CaseSelectSettings = {
  selector: string,
  algs: [string, string][],
  groups: string[],
  cubeOptions?: Partial<SRVisualizer.CubeOptions>
}

function splitAlgIntoGroups(algs: [string, string][], groups: string[], flags: number[]) {
  const algGroups : { [k: string] : [[string, string], number][] }= Object.fromEntries(groups.map(g => [g, []]))
  algs.forEach((alg, i) => {
    const prefix = alg[0].split("_", 1)[0]
    if (prefix in algGroups)
      algGroups[prefix].push([alg, i])
  })
  return algGroups
}

const useStyles = makeStyles(theme => {
  let is_bright = theme.palette.primary.main === '#556cd6'
  return ({
    caseBoxOn: {
      backgroundColor: is_bright ? '#bdedff' : theme.palette.primary.main,
    },
    groupBox: {
    }
  })
})

function CaseSelectContent(props: { state: AppState, dispatch: React.Dispatch<Action>, settings: CaseSelectSettings }) {
  let { selector, groups, algs } = props.settings
  const sel = (props.state.config as any)[selector] as Selector
  const algGroups = splitAlgIntoGroups(algs, groups, sel.flags)
  const handleSelectGroup = (groupname: string, value: number) => () => {
    const newFlags = [...sel.flags]
    algGroups[groupname].forEach( ([alg, i]) => {
      newFlags[i] = value
    })
    props.dispatch({ type: "config", content: {[selector]: sel.setFlags(newFlags) } } )
  }
  const handleSelectCase = (caseIdx: number) => () => {
    const newFlags = [...sel.flags]
    newFlags[caseIdx] = (newFlags[caseIdx] === 0) ? 1 : 0
    props.dispatch({ type: "config", content: {[selector]: sel.setFlags(newFlags) } } )
  }
  const handleSelectAll = (value: number) => () => {
    const newFlags = Array(sel.flags.length).fill(value)
    props.dispatch({ type: "config", content: {[selector]: sel.setFlags(newFlags)}})
  }
  const classes = useStyles()
  const gt_sm = useMediaQuery(theme.breakpoints.up('sm'));
  return (
    <Box display="flex" flexDirection="column" marginRight={10}>
      <Box marginBottom={3}>
        <ButtonGroup color="primary" style={{height: "2rem"}}>
          <Button onClick={handleSelectAll(1)}
            startIcon={<CheckCircleIcon/>}>Select All</Button>
          <Button onClick={handleSelectAll(0)}
            startIcon={<CancelIcon/>}>Deselect All</Button>
        </ButtonGroup>
      </Box>
      {groups.map((groupname, i) => (
        <Box display="flex" flexDirection={gt_sm ? "row" : "column"} key={i} className={classes.groupBox} marginBottom={2}>
          <Box display="flex" flexDirection={gt_sm ? "column" : "row"} marginRight={4} >

            <Box marginRight={2}>
            <Typography variant="h5" gutterBottom>
              {groupname[0].toUpperCase() + groupname.substr(1)}
            </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <ButtonGroup color="primary" variant="contained" aria-label="outlined primary button group" style={{height: "3.7rem"}}>
                <Button onClick={handleSelectGroup(groupname, 1)}
                  startIcon={<CheckCircleIcon/>}></Button>
                <Button  variant="outlined" onClick={handleSelectGroup(groupname, 0)}
                  startIcon={<CancelIcon/>}></Button>
              </ButtonGroup>
            </Box>
          </Box>
          <Box display="flex" flexDirection="row" flexWrap="wrap">
          {
            algGroups[groupname].map( ([[name, alg], idx]) =>
              <Box border={1} borderColor="primary.main" 
                key={name} 
                onClick={handleSelectCase(idx)}
                style={{transition: "all .3s ease" }}
                className={sel.flags[idx] ? classes.caseBoxOn : ""}>
                <CaseVisualizer 
                  name={name}
                  size={100}
                  alg={alg}
                  mask="cmll"
                  cubeOptions={props.settings.cubeOptions || {}}
                />
              </Box>
            )
          }
          </Box>
          <Divider></Divider>
        </Box>
      ))}
    </Box>
  )
}

const CaseSelectDialog = makeDialog(CaseSelectContent, {fullWidth: true})

export default CaseSelectDialog;