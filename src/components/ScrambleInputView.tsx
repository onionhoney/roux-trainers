import React, { Fragment } from 'react'

import {
    TextField,
    Divider,
    Button, Box,
    makeStyles,
    Typography,
    FormLabel, Dialog, DialogTitle, DialogContent, DialogActions
} from '@material-ui/core';

import EditIcon from '@material-ui/icons/Edit';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import RootRef from '@material-ui/core/RootRef';



import { AppState, Config, Action } from '../Types'
const useStyles = makeStyles(theme => ({

    setupEdit: {
        whiteSpace: 'pre-line',
        fontSize: "1.2rem",
        fontWeight:500,
        [theme.breakpoints.down('xs')]: {
        fontSize: "1.0rem",
        fontWeight: 500
        },
    },
    button: {
        marginRight: theme.spacing(1)
        //margin: theme.spacing(1)
    }
}))

export function ScrambleInputView(props: { display: string, scrambles: string[], dispatch: React.Dispatch<Action>}) {
    let classes = useStyles()
    let [editing, setEditing] = React.useState(false)
    let [value, setValue] = React.useState(props.scrambles.join("\n"))
    let textField = React.useRef<HTMLInputElement | null>(null)
    let container = React.useRef<HTMLInputElement | null>(null)
    let editButton = React.useRef<HTMLElement | null>(null)
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value)
        event.stopPropagation()
    }
    const onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        event.stopPropagation()
    }
    const toggleEdit = () => {
        setEditing(!editing)
    }
    const handleClose = () => {
        setEditing(false)
        props.dispatch({type: "scrambleInput", content: value.split("\n").filter(s => s.trim())})
    }
    React.useEffect(  () => {
        setValue(props.scrambles.join("\n"))
    }, [props.scrambles])

    /*
    React.useEffect( ()=> {
        if (editing) {
            textField.current && textField.current.focus()
        } else {
            textField.current && textField.current.blur()
            editButton.current && editButton.current.blur()
        }
    }, [editing]*/

    const onEntered = () => {
        textField.current && textField.current.focus()
    }
    return <>
    <Box>
            <Button variant={editing ? "contained" : "outlined"}
                color="primary"
                size="small"
                onClick={toggleEdit}
                className={classes.button}
                startIcon={<EditIcon />}
            >
                {"INPUT"}
            </Button>

    </Box>

    <Dialog open={editing} 
            onClose={handleClose}  
            onKeyPress={onKeyPress} 
            onKeyDown={onKeyPress} 
            onKeyUp={onKeyPress}
            onEntered={onEntered}
            >
          <DialogTitle> Input your own scrambles (one per line) </DialogTitle>
          <DialogContent>
                <TextField
                    inputRef={textField}
                    multiline
                    size="medium"
                    fullWidth
                    rowsMax={10}
                    rows={3}
                    InputProps={{
                        className:classes.setupEdit
                    }}
                
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
    </>
    /*
    return <Dialog open={props.open} onClose={handleClose}>
          <DialogTitle> Input your own scrambles  </DialogTitle>
          <DialogContent>
              Hello
          </DialogContent>
          <DialogActions>
              <Button onClick={handleClose} color="primary">
                  Confirm
              </Button>
          </DialogActions>
        </Dialog>
        */
}