// role: Protected component for the dashboard that checks authentication before rendering.

// Import the ProtectedContainer HOC to protect the component with authentication check
import ProtectedContainer from '../containers/ProtectedContainer';
// Import the DashBoard component
import DashBoard from './DashBoard';

// Create a named protected component for the dashboard
const ProtectedDashBoard = ProtectedContainer(DashBoard);

// Export the named protected dashboard component
export default ProtectedDashBoard;
