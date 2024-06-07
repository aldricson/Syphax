// src/components/ProtectedRoutes/ProtectedRoute.jsx
import { Route, Routes, Navigate } from 'react-router-dom';
import { observer } from 'mobx-react';
import authStore from '../../mobxStores/authStore';

const ProtectedRoute = observer(({ component: Component, ...rest }) => {
  return (
    <Routes>
    <Route
      {...rest}
      element={authStore.token ? <Component {...rest} /> : <Navigate to="/Login" />}
    />
    </Routes>
  );
});


export default ProtectedRoute;
