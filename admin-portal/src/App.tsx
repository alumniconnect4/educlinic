import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "sonner"
import { AuthProvider } from "./context/AuthContext"
import Login from "./pages/Login"
import Home from "./pages/Home"
import AnalyticsDetail from "./pages/AnalyticsDetail"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminLayout from "./components/layout/AdminLayout"

// User Management
import ManageUsersLayout from "./pages/users/ManageUsersLayout"
import ManageAdmins from "./pages/users/ManageAdmins"
import ManageAlumniStudents from "./pages/users/ManageAlumniStudents"
import PendingRequestsPage from "./pages/users/PendingRequestsPage"

// Other Pages
import Events from "./pages/Events"
import Gallery from "./pages/Gallery"
import HelpTickets from "./pages/HelpTickets"
import Settings from "./pages/Settings"

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster 
          position="bottom-right" 
          richColors 
          toastOptions={{
            style: {
              padding: '16px 20px',
              fontSize: '14px',
              borderRadius: '8px',
              minWidth: '320px'
            }
          }}
        />
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
              <Route path="pending-requests" element={<PendingRequestsPage />} />
            </Route>

            {/* Other Navigation Tabs */}
            <Route path="events" element={<Events />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="help-tickets" element={<HelpTickets />} />
            <Route path="settings" element={<Settings />} />
            <Route path="analytics/:role" element={<AnalyticsDetail />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
