import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { observer } from 'mobx-react';
import authStore from '../mobxStores/authStore';

const ProtectedRoute = observer(({ element: Component, ...rest }) => (
  <Route
    {...rest}
    element={authStore.token ? Component : <Navigate to="/login" />}
  />
));

export default ProtectedRoute;