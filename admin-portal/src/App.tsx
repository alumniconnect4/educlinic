<<<<<<< HEAD
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Home from "./pages/Home"
import AnalyticsDetail from "./pages/AnalyticsDetail"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminLayout from "./components/layout/AdminLayout"
=======
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Layout } from './components/Layout.tsx';
import { Login } from './pages/Login.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { Events } from './pages/Events.tsx';
import { EventForm } from './pages/EventForm.tsx';
import { EventDetails } from './pages/EventDetails.tsx';
import { Profile } from './pages/Profile.tsx';
import { Loader2 } from 'lucide-react';

// Route Guard to verify user is authenticated and is admin
const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/new" element={<EventForm mode="create" />} />
            <Route path="/events/edit/:id" element={<EventForm mode="edit" />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
>>>>>>> c34b6fd (admin-portal-making)

// User Management
import ManageUsersLayout from "./pages/users/ManageUsersLayout"
import ManageAdmins from "./pages/users/ManageAdmins"
import ManageAlumniStudents from "./pages/users/ManageAlumniStudents"

// Other Pages
import Events from "./pages/Events"
import Gallery from "./pages/Gallery"
import HelpTickets from "./pages/HelpTickets"
import Settings from "./pages/Settings"

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Admin Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<Home />} />

          {/* Manage Users (Nested) */}
          <Route path="users" element={<ManageUsersLayout />}>
            <Route index element={<ManageAdmins />} />
            <Route path="admins" element={<ManageAdmins />} />
            <Route path="alumni-students" element={<ManageAlumniStudents />} />
          </Route>

          {/* Other Navigation Tabs */}
          <Route path="events" element={<Events />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="help-tickets" element={<HelpTickets />} />
          <Route path="settings" element={<Settings />} />
          <Route path="analytics/:role" element={<AnalyticsDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
