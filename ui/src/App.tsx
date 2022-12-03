
import BasicTabs from "./TabPanel";
import WalletConnector from "./WalletConnector";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
// import { alchemyProvider } from "wagmi/providers/alchemy";
// import "@rainbow-me/rainbowkit/styles.css";
// import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
// import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
// import { publicProvider } from "wagmi/providers/public";

const darkTheme = createTheme({
    palette: {
        mode: 'light',
    },
});

// const { chains, provider } = configureChains(
//     [chain.polygonMumbai, chain.goerli, chain.hardhat],
//     [
//       alchemyProvider({ alchemyId: process.env.REACT_APP_QUICK_NODE_URL }),
//       publicProvider(),
//     ]
//   );
  
//   const { connectors } = getDefaultWallets({
//     appName: "My RainbowKit App",
//     chains,
//   });
  
//   const wagmiClient = createClient({
//     autoConnect: true,
//     connectors,
//     provider,
//   });

export default function App() {
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <BasicTabs />
            <WalletConnector />
        </ThemeProvider>
    )
}