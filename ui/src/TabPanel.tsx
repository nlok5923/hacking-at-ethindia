import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Container from '@mui/material/Container'
import Box from '@mui/material/Box';
import Verify from './tabs/Verify';
import Deploy from './tabs/Deploy';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const [value, setValue] = React.useState(1);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const [chain, setChain] = React.useState('');

  const handleChainChange = (event: SelectChangeEvent) => {
    setChain(event.target.value as string);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
        value={value} 
        onChange={handleChange} 
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile={true}
        aria-label="scrollable auto tabs example"
        >
          <Tab label="Infinito Labs" {...a11yProps(0)} disabled />
          <Tab label="Deploy" {...a11yProps(1)} />
          <Tab label="Send Asset" {...a11yProps(2)} />
        </Tabs>

        <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Select Chain</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={chain}
          label="chain"
          onChange={handleChainChange}
        >
          <MenuItem value={"Polygon"}>Polygon</MenuItem>
          <MenuItem value={"Shardeum"}>Shardeum</MenuItem>
          <MenuItem value={"Cronos"}>Cronos</MenuItem>
          <MenuItem value={"Gnosis"}>Gnosis</MenuItem>
        </Select>
      </FormControl>
    </Box>

      </Box>
      {/* <TabPanel value={value} index={1}>
        <Container><About /></Container>
      </TabPanel> */}
      <TabPanel value={value} index={1}>
        <Container>
          <Deploy />
          </Container>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Verify />
      </TabPanel>
    </Box>
  );
}
