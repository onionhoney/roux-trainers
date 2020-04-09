import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import {
  Button,
  Checkbox, IconButton, DialogContent, TextField, DialogContentText
} from '@material-ui/core';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';

import { Table, Paper, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';

import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import AddIcon from '@material-ui/icons/Add';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { AppState, Action, FavCase } from '../Types';


const useStyles = makeStyles(theme => ({
  table: {
    width: '100%',
    minWidth: 200,
    backgroundColor: theme.palette.background.paper,
  },
}));

export function warnDialog(props: { confirm: () => void} ) {

}

function parseAddString(state: AppState, s : string) : [ FavCase[], boolean] {
  const res : FavCase[] = []
  for (const line of s.split('\n')) {
    let cols = line.split(',')
    if (cols.length !== 2) continue
    let solver = cols[0].trim()
    let setup = cols[1].trim()
    if (["fb", "fbdr", "ss-front", "ss-back"].includes(solver)) {
      let case_ : FavCase = {
        mode: state.mode,
        solver,
        setup
      }
      res.push(case_)
    }
  }
  if (res.length > 0) return [res, true]
  else return [ [], false]
}

export default function FavListView(props: { state: AppState, dispatch: React.Dispatch<Action> }) {
  const {state, dispatch} = props
  const classes = useStyles();
  const play = (i: number) => () => {
    dispatch({ type: "favList", content: [ state.favList[i] ], action: "replay" })
  }
  const remove = () => {
    if (dialogID >= 0 && dialogID < state.favList.length)
    dispatch({ type: "favList", content: [ state.favList[dialogID] ], action: "remove" })
  }
  const favList = state.favList.filter(c => c.mode === state.mode)

  const [ dialogID, setDialogID ] = React.useState(-1)

  const handleClose = () => setDialogID(-1)
  const handleRemove = () => { remove(); setDialogID(-1); }
  const dialogDelete = (<Dialog open={dialogID >= 0} onClose={handleClose} >
    <DialogTitle id="alert-dialog-title">{"Delete this alg from favorites?"}</DialogTitle>
    <DialogActions>
      <Button onClick={handleClose} color="primary">
        No
    </Button>
      <Button onClick={handleRemove} color="primary" autoFocus>
        Yes
    </Button>
    </DialogActions>
  </Dialog>)

  const [ addDialogOpen, setAddDialogOpen ] = React.useState(false)
  const [ addString, setAddString ] = React.useState("")
  const handleAdd = () => setAddDialogOpen(true)
  const handleAddClose = () => setAddDialogOpen(false)
  const handleAddSuccess = () => {
    let [res, status] = parseAddString(state, addString)
    if (status) {
      dispatch({ type: "favList", content: res, action: "add" })
    }
    handleAddClose()
  }
  const handleTextChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setAddString(event.target.value)
  }
  const dialogAdd = <Dialog open={addDialogOpen} onClose={handleAddClose} aria-labelledby="form-dialog-title">
    <DialogTitle id="form-dialog-title">Add New Cases</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Input your cases here. (one per line) <br></br>
        Format: [category], [setup algorithm].
        category := fb | fbdr | ss-front | ss-back
      </DialogContentText>
      <TextField
        autoFocus
        multiline
        margin="dense"
        id="name"
        fullWidth
        onChange={handleTextChange}
        onKeyDown={ (event) => { event.stopPropagation() } }
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={handleAddClose} color="primary">
        Cancel
    </Button>
      <Button onClick={handleAddSuccess} color="primary">
        Add All
    </Button>
    </DialogActions>
  </Dialog>


  return (
    <div>
    {dialogDelete}
    {dialogAdd}
    <Paper>
      <Table className={classes.table} size="small" >
        <TableHead>
          <TableRow>
            <TableCell align="center"> Scramble </TableCell>
            <TableCell align="center" rowSpan={1}>
              <IconButton   onClick={handleAdd} component="span" edge="end" size="small" color="primary">
                <AddIcon />
              </IconButton>
            {/* <IconButton component="span" edge="end" size="small" color="primary">
                <FileCopyIcon />
              </IconButton> */}
             </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {favList.map((value, i) => {
            //const labelId = `favlist-label-${i}`;
            return (
              <TableRow key={i}>
                {/* <TableCell align="center" >
                  {/* padding=checkbox <Checkbox></Checkbox> */}

                <TableCell align="center"> {value.solver + " , " + value.setup} </TableCell>
                <TableCell align="center">
                  <IconButton onFocus={(e: { target: { blur: () => void; }; }) => e.target.blur() } onClick={play(i)}
                  component="span" edge="end" size="small" color="primary">
                    <PlaylistPlayIcon />
                  </IconButton>

                  <IconButton onFocus={(e: { target: { blur: () => void; }; }) => e.target.blur() } onClick={() => setDialogID(i)}
                  component="span" edge="end" size="small" color="primary">
                    <DeleteOutlineIcon />
                  </IconButton>

                </TableCell>
              </TableRow>
            )
          })}</TableBody>
      </Table>
    </Paper>
    </div>
  )
}