import React, { Fragment } from 'react'

import {
    TextField,
    Divider,
    Button, Box,
    FormLabel, Dialog, DialogTitle, DialogContent, DialogActions
} from '@material-ui/core';

import SettingsIcon from '@material-ui/icons/Settings';

import { AppState, Config, Action } from '../Types';
import { ColorScheme } from '../lib/CubeLib';

import { MultiSelectContent } from './Select';

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
            defaultValue="Default Value"
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
    let select = (config: Config) => { return config.orientationSelector }
    let {label, content} = MultiSelectContent({state, dispatch, select})

    const [open, setOpen] = React.useState(false);
    const handleClickOpen = () => {
      setOpen(true);
    };
    const handleClose = () => {
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
        <Dialog disableBackdropClick disableEscapeKeyDown open={open} onClose={handleClose}>
          <DialogTitle> Set Orientation (U-F) and Color Scheme  </DialogTitle>
          <DialogContent>
            {content}
            <Box height={20}/>
                <Divider />
            <Box height={20}/>
            <ColorSetter {...{state, dispatch}}/>

          </DialogContent>
          <DialogActions>
              <Button onClick={handleClose} color="primary">
                  Close
              </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
}