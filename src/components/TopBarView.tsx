import React from "react";

import { makeStyles } from '@material-ui/core';
import Toolbar from '@material-ui/core/Toolbar';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { ENABLE_DEV } from '../settings';
import InfoIcon from '@material-ui/icons/Info';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import Brightness6Icon from '@material-ui/icons/Brightness6';
import IconButton from "@material-ui/core/IconButton";
import Container from "@material-ui/core/Container";

const useStyles = makeStyles(theme => {
    let is_bright = theme.palette.primary.main === '#556cd6';
    return ({
    page: {
      backgroundColor: theme.palette.background.default
    },
    container: {
      display: "flex"
    },
    icon: {
      minWidth: 0
    },
    root: {
      display: "flex"
    },
    bar: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.background.paper,
      //borderRadius: "5px"
      display: "flex",
      flexWrap: "nowrap",
      justifyContent: "space-between",
    },
    select: {
      backgroundColor: is_bright ? "#657ce9" : "#bfc4e2",
      color: theme.palette.background.paper,
      paddingLeft: 12,
      marginRight: 15,
      marginLeft: 15,
      fontWeight: 500,
      fontSize: "0.9rem",
      paddingTop: 8,
      paddingBottom: 8,
      borderRadius: 4,
      //borderBottom: "1px solid " + theme.palette.background.default,
    }
})})
const description = [
"FB Last Pair (+DR)", "First Square", "First Block", "Second Square", "CMLL", "LSE 4c", "EOLR / EOLRb"
]

function TopBarView(props: { value: number, onChange: (x: number) => void,
    toggleFav: () => void, toggleBright: () => void, handleInfoOpen: () => void } )
{
    let classes = useStyles()
    let { value, onChange, toggleFav, toggleBright, handleInfoOpen } = props
    let value_str = description[value]
    let handleChange = (event: React.ChangeEvent<{ value: unknown }>) =>  {
        onChange(description.indexOf(event.target.value as string))
    }
    return <div>
            <Box boxShadow={4} >
        <Toolbar className={classes.bar} >
        <Typography style={{fontSize: "0.9rem", fontFamily: "Public Sans", flexShrink: 10}} >
            Roux Trainer
        </Typography>
        <FormControl style={{flexShrink: 1}}>
            <Select
                 value={value_str}
                 className={classes.select}
                 onChange={handleChange}
            >
                { description.map( (s, i) => <MenuItem key={i} value={s}>{s}</MenuItem> )}
            </Select>
        </FormControl>
        <Box style={{flexGrow: 10}}> </Box>
        <IconButton onClick={toggleFav}>
            <BookmarkIcon />
        </IconButton>
        <IconButton onClick={toggleBright}>
            <Brightness6Icon/>
        </IconButton>
        <IconButton onClick={handleInfoOpen}>
            <InfoIcon />
        </IconButton>
        </Toolbar>
        </Box>
    </div>
}

export default TopBarView;