import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, user, redirectTo = '/signin' }) => {
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;