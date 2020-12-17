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
    setup: {
        whiteSpace: 'pre-line',
        fontSize: "1.4rem",
        fontWeight:500,
        [theme.breakpoints.down('xs')]: {
        fontSize: "1.0rem",
        fontWeight: 500
        },
    },
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
    let [value, setValue] = React.useState(props.display)
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
    React.useEffect(  () => {
        setValue(props.display)
    }, [props.display])

    const onBlur = () => {
        if (editing) setEditing(false)
    }
    React.useEffect( ()=> {
        if (editing) {
            textField.current && textField.current.focus()
        } else {
            textField.current && textField.current.blur()
            editButton.current && editButton.current.blur()
        }
    }, [editing])
    return <RootRef rootRef={container}>
    <Box style={{width: "100%"}}>
        <Box onKeyPress={onKeyPress} onKeyDown={onKeyPress} onKeyUp={onKeyPress}>
            <Box display={editing ? "none" : "block"}>
                <Typography className={classes.setup} >
                    {props.display}
                </Typography>
            </Box>
            <Box display={editing ? "block" : "none"} style={{minWidth: 300}} >
                <TextField
                    inputRef={textField}
                    multiline
                    size="medium"
                    fullWidth
                    rowsMax={5}
                    InputProps={{
                        className:classes.setupEdit
                    }}
                    value={value}
                    onChange={onChange}
                    variant="standard">
                </TextField>
            </Box>
            <Box style={{marginTop: 10}}>
            <Button variant={editing ? "contained" : "outlined"}
                color="primary"
                size="small"
                onClick={toggleEdit}
                ref={editButton}
                className={classes.button}
                startIcon={<EditIcon />}
            >
                {editing ? "Finish": "Edit"}
            </Button>
            <Button
                variant="outlined"
                color="primary"
                size="small"
                className={classes.button}
                startIcon={<SaveAltIcon />}
            >
                Export
            </Button>
            </Box>
        </Box>
    </Box>
    </RootRef>
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