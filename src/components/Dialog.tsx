import React from 'react';
import { FormLabel, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControl } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { getDefaultCompilerOptions } from 'typescript';

export interface DialogProps {
  label: string,
  title?: string,
}
export interface DialogOptions {
  fullWidth? : boolean
}
const defaultOptions = {
  fullWidth: false
}

const makeDialog = <P extends object>(
  Component: React.ComponentType<P>, options?: DialogOptions
) => (function DialogView(props: P & DialogProps) {
  options = options || defaultOptions
  const title = props.title || props.label
  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  }

  return (
  <Box>
    <FormLabel component="legend">{props.label}</FormLabel>
    <Box height={8}/>
    <Button color="primary" variant="outlined" style={{borderWidth: 2}} onClick={handleClickOpen}>
      <SettingsIcon fontSize="small" color="primary" style={{marginLeft: -6, marginRight: 3}}></SettingsIcon>
        {"SELECT"}
    </Button>
    <Box height={8}/>


    <Dialog disableEscapeKeyDown open={open} onClose={handleClose} maxWidth="md" style={{marginLeft: 10,marginRight: 10}}> 
      <DialogTitle> {title} </DialogTitle>
      <DialogContent >
        <Box paddingLeft={1}>
          <Component {...props}/>
        </Box>
      </DialogContent>
      <DialogActions>
          <Button onClick={handleClose} color="primary" size="large" >
            {"CLOSE" }
          </Button>
      </DialogActions>
    </Dialog>
    </Box>
  )

})

export {makeDialog}