// src/components/ProtectedRoutes/ProtectedRoute.jsx
import { Route, Navigate } from 'react-router-dom';
import { observer } from 'mobx-react';
import authStore from '../../mobxStores/authStore';

const ProtectedRoute = observer(({ component: Component, ...rest }) => (
  <Route
    {...rest}
    element={
      authStore.token ? <Component {...rest} /> : <Navigate to="/login" />
    }
  />
));

export default ProtectedRoute;
