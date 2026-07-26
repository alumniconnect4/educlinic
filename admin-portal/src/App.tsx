import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Home from "./pages/Home"
import AnalyticsDetail from "./pages/AnalyticsDetail"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminLayout from "./components/layout/AdminLayout"

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
