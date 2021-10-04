import React from "react";

import makeStyles from '@mui/styles/makeStyles';
import Toolbar from '@mui/material/Toolbar';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';

import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InfoIcon from '@mui/icons-material/Info';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import Brightness6Icon from '@mui/icons-material/Brightness6';
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import { SelectChangeEvent } from '@mui/material/Select';
import { tab_modes } from "./AppView";


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
      backgroundColor: is_bright ? theme.palette.primary.main : '#6e728a', // ,
      color: theme.palette.background.paper,
      //borderRadius: "5px"
      display: "flex",
      flexWrap: "nowrap",
      justifyContent: "space-between",
    },
    select: {
      backgroundColor: is_bright ? "#657ce9" : "#9095b2", //9297b3", //9FA4C2",
      color: theme.palette.background.paper,
      paddingLeft: 35,
      marginRight: 5,
      marginLeft: 15,
      height: 60,
      fontWeight: 400,
      fontSize: "1.0rem",
      paddingTop: 4,
      paddingBottom: 7,
      //borderBottom: "1px solid " + theme.palette.background.default,
    }
})})


function TopBarView(props: { value: number, onChange: (x: number) => void,
    toggleFav: () => void, toggleBright: () => void, handleInfoOpen: () => void } )
{
    let classes = useStyles()
    let { value, onChange, toggleFav, toggleBright, handleInfoOpen } = props
    let value_str = tab_modes[value][1] || ""
    let handleChange = (event: SelectChangeEvent<String>) =>  {
        let tab_idx = tab_modes.findIndex(x => x[1] === (event.target.value as string))
        onChange(tab_idx)
        //
    }
    return (
        <div>
                <Box boxShadow={4} >
            <Toolbar className={classes.bar} >
            <Typography style={{fontSize: "0.9rem", fontFamily: "Public Sans", flexShrink: 10}} >
                Roux Trainer
            </Typography>
            <Box paddingX={0.5}/>
            <Box>
                <Select
                     fullWidth
                     value={value_str}
                     className={classes.select}
                     onChange={handleChange}
                     onFocus={(e) => e.target.blur()}
                     variant="standard"
                >
                    { tab_modes.map( (s, i) => 
                      <MenuItem key={i} value={s[1]} sx={{mx: 1.5}} style={{fontSize: "1.1rem", marginBottom: 5}}>
                        {s[1]}
                      </MenuItem> 
                    )}
                </Select>
            </Box>
            <Box style={{flexGrow: 10}}> </Box>
            <Box>
              <IconButton onClick={toggleFav} size="large">
                  <BookmarkIcon />
              </IconButton>
              <IconButton onClick={toggleBright} size="large">
                  <Brightness6Icon/>
              </IconButton>
              <IconButton onClick={handleInfoOpen} size="large">
                  <InfoIcon />
              </IconButton>
            </Box>
            </Toolbar>
            </Box>
        </div>
    );
}

export default TopBarView;