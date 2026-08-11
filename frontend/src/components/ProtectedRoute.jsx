import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const location = useLocation();

    if (!token) {
        // Redirect to login, but securely pass the location they were TRYING to access
        // This allows you to redirect them back to that exact page after they log in
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If they have a token, render the requested page
    return children;
};

export default ProtectedRoute;
