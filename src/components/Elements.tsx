import { Divider, Theme } from '@mui/material';

import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';

const styles = (theme: Theme) => createStyles({
    root: {
        backgroundColor: theme.palette.text.disabled,
    },
});

const MyDivider = withStyles(styles)(Divider);

export {MyDivider as Divider}
