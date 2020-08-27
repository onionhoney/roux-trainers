import {
    Divider,
    withStyles,
    Theme,
    createStyles
} from '@material-ui/core';

const styles = (theme: Theme) => createStyles({
    root: {
        backgroundColor: theme.palette.text.hint,
    },
});

const MyDivider = withStyles(styles)(Divider);

export {MyDivider as Divider}
