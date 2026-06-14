import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./store/authStore";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleBasedRoute } from "./components/RoleBasedRoute";
import { Loader } from "./components/Loader";

// Pages
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Profile } from "./pages/Profile";
import { ProjectListing } from "./pages/ProjectListing";
import { ProjectDetail } from "./pages/ProjectDetail";
import { PostProject } from "./pages/PostProject";
import { ClientDashboard } from "./pages/ClientDashboard";
import { FreelancerDashboard } from "./pages/FreelancerDashboard";
import { MyBids } from "./pages/MyBids";
import { SavedProjects } from "./pages/SavedProjects";
import { Chat } from "./pages/Chat";
import { Unauthorized } from "./pages/Unauthorized";
import { NotFound } from "./pages/NotFound";

function App() {
  const { checkAuth, isCheckingAuth, currentUser } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return <Loader fullPage />;
  }

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-[#121212] text-white">
        
        {/* Navigation bar on top */}
        <Navbar />

        {/* Main page content area */}
        <main className="flex-grow">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/projects" element={<ProjectListing />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            
            {/* Auth routes (redirect home if logged in) */}
            <Route
              path="/login"
              element={currentUser ? <Navigate to="/" replace /> : <Login />}
            />
            <Route
              path="/register"
              element={currentUser ? <Navigate to="/" replace /> : <Register />}
            />

            {/* Protected shared routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />

            {/* Client dashboard & actions */}
            <Route
              path="/client/dashboard"
              element={
                <RoleBasedRoute allowedRoles={["CLIENT"]}>
                  <ClientDashboard />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/project/post"
              element={
                <RoleBasedRoute allowedRoles={["CLIENT"]}>
                  <PostProject />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/client/projects"
              element={
                <RoleBasedRoute allowedRoles={["CLIENT"]}>
                  <ClientDashboard />
                </RoleBasedRoute>
              }
            />

            {/* Freelancer dashboard & actions */}
            <Route
              path="/freelancer/dashboard"
              element={
                <RoleBasedRoute allowedRoles={["FREELANCER"]}>
                  <FreelancerDashboard />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/freelancer/bids"
              element={
                <RoleBasedRoute allowedRoles={["FREELANCER"]}>
                  <MyBids />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/freelancer/saved"
              element={
                <RoleBasedRoute allowedRoles={["FREELANCER"]}>
                  <SavedProjects />
                </RoleBasedRoute>
              }
            />

            {/* Error fallback routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Global react-hot-toast overlay */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#181818",
              color: "#FFFFFF",
              border: "1px solid #2A2A2A",
              borderRadius: "12px",
              padding: "12px 16px",
            },
            success: {
              iconTheme: {
                primary: "#1DB954",
                secondary: "#FFFFFF",
              },
            },
          }}
        />

      </div>
    </BrowserRouter>
  );
}

export default App;
