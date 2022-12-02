
import BasicTabs from "./TabPanel";
import WalletConnector from "./WalletConnector";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
    palette: {
        mode: 'light',
    },
});

export default function App() {
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <BasicTabs />
            <WalletConnector />
        </ThemeProvider>
    )
}