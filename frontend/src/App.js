// frontend/src/App.js
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/ToastContainer';
import React from 'react';
import { ToastContainer as ReactToastifyContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import DoctorLayout from './layouts/DoctorLayout';
import PatientLayout from './layouts/PatientLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PatientRegister from './pages/auth/PatientRegister';
import DoctorRegister from './pages/auth/DoctorRegister';
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientDashboard from './pages/patient/PatientDashboard';
import PageNotFound from './pages/PageNotFound';
import Unauthorized from './pages/Unauthorized';
import DoctorProfile from './pages/doctor/DoctorProfile';
import PatientAppointments from './pages/patient/PatientAppointments';
import ViewPrescription from './pages/patient/ViewPrescription';
import FindDoctors from './components/patient/FindDoctors';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import PatientProfile from './pages/patient/PatientProfile';
import AdminLogin from './pages/auth/AdminLogin';
import AdminRegister from './pages/auth/AdminRegister';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ToastContainer />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="register/patient" element={<PatientRegister />} />
            <Route path="register/doctor" element={<DoctorRegister />} />
            <Route path="unauthorized" element={<Unauthorized />} />
            <Route path="admin/login" element={<AdminLogin />} />
            <Route path="admin/register" element={<AdminRegister />} />
          </Route>

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Doctor routes */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="profile" element={<DoctorProfile />} />
          </Route>

          {/* Patient routes */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="find-doctors" element={<FindDoctors />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="prescription/:id" element={<ViewPrescription />} />
          </Route>

          {/* Protected prescription view route */}
          <Route
            path="/patient/prescription/:id"
            element={
              <ProtectedRoute roles={['patient']}>
                <ViewPrescription />
              </ProtectedRoute>
            }
          />

          {/* Doctor profile */}
          <Route path="/doctors/:id" element={<DoctorProfile />} />

          {/* 404 */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;