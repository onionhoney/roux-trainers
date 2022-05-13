import React, { Fragment } from 'react'

import {
    TextField,
    Divider,
    Button, Box,
    FormLabel, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';

import SettingsIcon from '@mui/icons-material/Settings';

import { AppState, Action } from '../Types';
import { Config } from '../Config';
import { ColorScheme } from '../lib/CubeLib';

import { MultiSelectContent } from './SelectorViews';

export function ColorSetter(props: {state: AppState, dispatch: React.Dispatch<Action>}) {
    const [text, setText] = React.useState(props.state.colorScheme.toUserInput().join(","))
    const handleChange = (event: any) => setText(event.target.value);
    const handleClick = () => {
        let arr = text.split(",")
        props.dispatch({
            type: "colorScheme",
            content: arr.length === 7? arr : ColorScheme.default_colors
        })
    }
    return (
        <Fragment>
        <Box>
        <TextField
            label="Color"
            helperText="G,B,R,O,Y,W,Gray"
            onChange={handleChange}
            fullWidth
            value={text}
        /></Box>

        <Box>
        <Button variant="outlined" size="medium" color="primary" onClick={handleClick} >
            Set color
        </Button>
        </Box>
        </Fragment>
    )
}

export function ColorPanel(props: {state: AppState, dispatch: React.Dispatch<Action>}) {
    let { state, dispatch } = props
    let select = "orientationSelector"
    let {content} = MultiSelectContent({state, dispatch, select})

    const [open, setOpen] = React.useState(false);
    const handleClickOpen = () => {
      setOpen(true);
    };
    const handleClose = (e: any, reason: string) => {
      if (reason === "backdropClick") 
        setOpen(false);
    }
    return (
        <div>
        <FormLabel component="legend">Orientation and Color Scheme</FormLabel>
        <Box height={8}/>
        <Button color="primary" variant="outlined" style={{borderWidth: 2}} onClick={handleClickOpen}>
        <SettingsIcon fontSize="small" color="primary" style={{marginLeft: -6, marginRight: 3}}></SettingsIcon>
          Edit
        </Button>
        <Box height={8}/>
        <Dialog disableEscapeKeyDown open={open} onClose={handleClose}>
          <DialogTitle> Set Orientation (U-F) and Color Scheme  </DialogTitle>
          <DialogContent>
            {content}
            <Box height={20}/>
                <Divider />
            <Box height={20}/>
            <ColorSetter {...{state, dispatch}}/>

          </DialogContent>
          <DialogActions>
              <Button onClick={() => setOpen(false)} color="primary">
                  Close
              </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
}