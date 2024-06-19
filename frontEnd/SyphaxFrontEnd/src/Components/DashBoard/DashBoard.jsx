// role: Component for displaying the dashboard with tabs for different drilling parameters and gas analysis.

// Import Tabs component from MUI for tab navigation
import Tabs from '@mui/material/Tabs';
// Import Tab component from MUI for individual tabs
import Tab from '@mui/material/Tab';
// Import Box component from MUI for layout
import Box from '@mui/material/Box';
// Import observer from MobX for observing state changes
import { observer } from 'mobx-react';
// Import the dashboard store from MobX to manage dashboard state
import { dashBoardStore } from '../../mobxStores/dashBoardStore';
// Import CustomTabPanel component for displaying tab content
import CustomTabPanel from './CustomTabPanel';
// Import SimpleLed component to display an LED indicator
import SimpleLed from '../Leds and Switches/SimpleLed';

/**
 * Accessibility props function.
 * 
 * Generates accessibility properties for each tab to enhance usability.
 * 
 * @param {number} index - The index of the tab.
 * @returns {object} Accessibility properties for the tab.
 */
function a11yProps(index) {
  return {
    id: `simple-tab-${index}`, // Unique ID for the tab
    'aria-controls': `simple-tabpanel-${index}`, // ARIA controls for the associated tab panel
  };
}

/**
 * DashBoard component.
 * 
 * This functional component renders the dashboard with tabs for different drilling parameters and gas analysis.
 * It observes the state from the dashBoardStore to manage tab changes and display the appropriate content.
 * It also includes a status bar with a SimpleLed component that is always visible at the bottom.
 * 
 * @returns {JSX.Element} The rendered dashboard component.
 */
const DashBoard = observer(function DashBoard() {
  return (
    // Container for the dashboard
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Container for the tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={dashBoardStore.tabSheetIndex} // Bind the selected tab index to the store
          onChange={dashBoardStore.onHandleDashBoardTabsheetChanged} // Handle tab changes using the store's method
          aria-label="elyteq Syphax" // ARIA label for accessibility
        >
          <Tab label="Drilling parameters (time)" {...a11yProps(0)} /> {/* Tab for drilling parameters (time) */}
          <Tab label="Drilling parameters (depth)" {...a11yProps(1)} /> {/* Tab for drilling parameters (depth) */}
          <Tab label="Gaz analysis" {...a11yProps(2)} /> {/* Tab for gas analysis */}
        </Tabs>
      </Box>
      {/* Container for the tab panels */}
      <Box sx={{ flex: 1 }}>
        <CustomTabPanel value={dashBoardStore.tabSheetIndex} index={0}> {/* Panel for the first tab */}
          Item One
        </CustomTabPanel>
        <CustomTabPanel value={dashBoardStore.tabSheetIndex} index={1}> {/* Panel for the second tab */}
          Item Two
        </CustomTabPanel>
        <CustomTabPanel value={dashBoardStore.tabSheetIndex} index={2}> {/* Panel for the third tab */}
          Item Three
        </CustomTabPanel>
      </Box>
      {/* Status bar container */}
      <Box sx={{ borderTop: 1, borderColor: 'divider', padding: '10px', display: 'flex', alignItems: 'center' }}>
        <SimpleLed /> {/* Add the SimpleLed component in the status bar */}
      </Box>
    </Box>
  );
});

// Export the DashBoard component
export default DashBoard;
