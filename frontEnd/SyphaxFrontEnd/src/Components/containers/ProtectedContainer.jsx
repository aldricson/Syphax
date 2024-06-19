// role: Higher-Order Component (HOC) that wraps any component to check the access token before rendering it using MobX.

import  { Component } from 'react'; // Import React library
import { observer } from 'mobx-react'; // Import observer from MobX for observing state changes
import authStore from '../../mobxStores/authStore'; // Import the authentication store

/**
 * ProtectedContainer HOC.
 * 
 * This higher-order component wraps around any component to check the access token before rendering it.
 * If the token is invalid, it logs out the user and redirects to the login page.
 * 
 * @param {React.ComponentType} WrappedComponent - The component to be wrapped and protected.
 * @returns {React.ComponentType} The protected component.
 */
const ProtectedContainer = (WrappedComponent) => {
  class ProtectedComponent extends Component {
    async componentDidMount() {
      await authStore.checkAuthAndRedirect(); // Check authentication and redirect if necessary
    }

    render() {
      return authStore.token ? <WrappedComponent {...this.props} /> : null; // Render the wrapped component if authenticated
    }
  }

  return observer(ProtectedComponent);
};

export default ProtectedContainer;
