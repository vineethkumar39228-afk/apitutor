import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import InteractiveWorkspace from './InteractiveWorkspace';
import Layout from './Layout';
import ProblemDisplay from './ProblemDisplay';
import Register from './Register';
import Leaderboard from './Leaderboard';
import ProblemCatalog from '../pages/ProblemCatalog';
import ProtectedRoute from './ProtectedRoute';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="catalog" element={
                        <ProtectedRoute>
                            <ProblemCatalog />
                        </ProtectedRoute>
                    } />
                    <Route path="questions" element={
                        <ProtectedRoute>
                            <ProblemCatalog />
                        </ProtectedRoute>
                    } />
                    <Route path="leaderboard" element={
                        <ProtectedRoute>
                            <Leaderboard />
                        </ProtectedRoute>
                    } />
                    <Route path="problem/:id" element={
                        <ProtectedRoute>
                            <InteractiveWorkspace />
                        </ProtectedRoute>
                    } />
                    <Route path="docs" element={<div>Docs Page</div>} />
                    <Route path="about" element={<div>About Page</div>} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;