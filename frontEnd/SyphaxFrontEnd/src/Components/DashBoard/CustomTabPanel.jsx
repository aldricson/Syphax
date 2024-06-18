// role: Provides a custom tab panel component for displaying content in different tabs.

// Import observer from MobX to create an observer component that reacts to state changes in MobX stores.
import { observer } from 'mobx-react';
// Import the custom tab store from MobX which contains the state for the tab panels.
import tabStore from '../../mobxStores/customTabStore';
// Import the Box component from Material-UI (MUI) for layout and styling.
import Box from '@mui/material/Box';

/**
 * CustomTabPanel component.
 * 
 * This functional component renders the content of a tab panel.
 * It is an observer component that reacts to changes in the tab store's state.
 * 
 * @param {object} props - The properties passed to the component.
 * @param {ReactNode} props.children - The content to display within the tab panel.
 * @param {number} props.index - The index of the tab panel.
 * @param {object} [props.other] - Any other properties passed to the component.
 * @returns {JSX.Element} The rendered tab panel component.
 */
const CustomTabPanel = observer(({ children, index, ...other }) => {
  // Destructure the children, index, and any other props passed to the component.

  // Get the current value of the selected tab from the tab store.
  const value = tabStore.value;

  return (
    // Return a div element that serves as the container for the tab panel.
    <div
      role="tabpanel" // ARIA role for accessibility, indicating this div is a tab panel.
      hidden={value !== index} // Hide the panel if it is not the selected tab.
      id={`simple-tabpanel-${index}`} // Unique ID for the tab panel, using the index.
      aria-labelledby={`simple-tab-${index}`} // ARIA attribute to link the tab panel with the corresponding tab.
      {...other} // Spread any other props passed to the component onto this div.
    >
      {/* If this tab panel is the selected one, render its children inside a Box component for padding and styling. */}
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
});

// Export the CustomTabPanel component as the default export.
export default CustomTabPanel;
