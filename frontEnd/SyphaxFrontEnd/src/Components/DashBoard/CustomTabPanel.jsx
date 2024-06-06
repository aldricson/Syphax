import { observer } from 'mobx-react';
import tabStore from '../../mobxStores/customTabStore';
import Box from '@mui/material/Box';

const CustomTabPanel = observer(({ children, index, ...other }) => {
  const value = tabStore.value;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
});

export default CustomTabPanel;
