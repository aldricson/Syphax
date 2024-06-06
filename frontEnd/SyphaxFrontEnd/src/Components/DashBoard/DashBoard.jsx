import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { observer } from 'mobx-react';
import { dashBoardStore } from '../../mobxStores/dashBoardStore';
import { CustomTabPanel } from './CustomTabPanel.jsx';


// Accessibility props function
function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }


const DashBoard = observer(function DashBoard() {
    return (
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={dashBoardStore.tabSheetIndex} onChange={dashBoardStore.onHandleDashBoardTabsheetChanged} aria-label="elyteq Syphax">
              <Tab label="Drilling parameters (time)" {...a11yProps(0)} />
              <Tab label="Drilling parameters (depth)" {...a11yProps(1)} />
              <Tab label="Gaz analysis" {...a11yProps(2)} />
            </Tabs>
          </Box>
          <CustomTabPanel value={dashBoardStore.tabSheetIndex} index={0}>
            Item One
          </CustomTabPanel>
          <CustomTabPanel value={dashBoardStore.tabSheetIndex} index={1}>
            Item Two
          </CustomTabPanel>
          <CustomTabPanel value={dashBoardStore.tabSheetIndex} index={2}>
            Item Three
          </CustomTabPanel>
        </Box>
      );
})

export default DashBoard;
