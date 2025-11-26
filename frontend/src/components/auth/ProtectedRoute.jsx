// frontend/src/components/auth/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    // Show loading state while checking authentication
    return (
      <div className='flex justify-center items-center min-h-screen'>
        Loading...
      </div>
    );
  }

  // If no specific roles are provided, allow any authenticated user
  if (
    isAuthenticated &&
    (!allowedRoles.length || allowedRoles.includes(user?.role))
  ) {
    return <Outlet />;
  }

  if (!isAuthenticated) {
    // User not logged in, redirect to login with return URL
    return (
      <Navigate
        to='/login'
        state={{ from: window.location.pathname }}
        replace
      />
    );
  }

  // User is logged in but doesn't have required role
  return <Navigate to='/' replace />;
};

export default ProtectedRoute;
