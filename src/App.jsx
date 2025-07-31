import "@/index.css";
import React, { createContext, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "@/store/store";
import { clearUser, setUser } from "@/store/userSlice";
import Login from "@/components/pages/Login";
import Signup from "@/components/pages/Signup";
import Callback from "@/components/pages/Callback";
import ErrorPage from "@/components/pages/ErrorPage";
import ResetPassword from "@/components/pages/ResetPassword";
import PromptPassword from "@/components/pages/PromptPassword";
import Sidebar from "@/components/organisms/Sidebar";
import ReportsPage from "@/components/pages/ReportsPage";
import DealsPage from "@/components/pages/DealsPage";
import SettingsPage from "@/components/pages/SettingsPage";
import MarketingPage from "@/components/pages/MarketingPage";
import ContactsPage from "@/components/pages/ContactsPage";
import { CustomPropertyProvider } from "@/contexts/CustomPropertyContext";

// Create auth context
export const AuthContext = createContext(null);

function AppContent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const userState = useSelector((state) => state.user);
  const isAuthenticated = userState?.isAuthenticated || false;

  const handleMobileMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Initialize ApperUI once when the app loads
  useEffect(() => {
    const { ApperClient, ApperUI } = window.ApperSDK;
    
    const client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    ApperUI.setup(client, {
      target: '#authentication',
      clientId: import.meta.env.VITE_APPER_PROJECT_ID,
      view: 'both',
      onSuccess: function (user) {
        setIsInitialized(true);
        let currentPath = window.location.pathname + window.location.search;
        let redirectPath = new URLSearchParams(window.location.search).get('redirect');
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || 
                           currentPath.includes('/callback') || currentPath.includes('/error') || 
                           currentPath.includes('/prompt-password') || currentPath.includes('/reset-password');
        
        if (user) {
          if (redirectPath) {
            navigate(redirectPath);
          } else if (!isAuthPage) {
            if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
              navigate(currentPath);
            } else {
              navigate('/contacts');
            }
          } else {
            navigate('/contacts');
          }
          dispatch(setUser(JSON.parse(JSON.stringify(user))));
        } else {
          if (!isAuthPage) {
            navigate(
              currentPath.includes('/signup')
                ? `/signup?redirect=${currentPath}`
                : currentPath.includes('/login')
                ? `/login?redirect=${currentPath}`
                : '/login'
            );
          } else if (redirectPath) {
            if (
              !['error', 'signup', 'login', 'callback', 'prompt-password', 'reset-password'].some((path) => currentPath.includes(path))
            ) {
              navigate(`/login?redirect=${redirectPath}`);
            } else {
              navigate(currentPath);
            }
          } else if (isAuthPage) {
            navigate(currentPath);
          } else {
            navigate('/login');
          }
          dispatch(clearUser());
        }
      },
      onError: function(error) {
        console.error("Authentication failed:", error);
      }
    });
  }, [navigate, dispatch]);
  
  const authMethods = {
    isInitialized,
    logout: async () => {
      try {
        const { ApperUI } = window.ApperSDK;
        await ApperUI.logout();
        dispatch(clearUser());
        navigate('/login');
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };
  
  if (!isInitialized) {
    return (
      <div className="loading flex items-center justify-center p-6 h-full w-full">
        <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4"></path>
          <path d="m16.2 7.8 2.9-2.9"></path>
          <path d="M18 12h4"></path>
          <path d="m16.2 16.2 2.9 2.9"></path>
          <path d="M12 18v4"></path>
          <path d="m4.9 19.1 2.9-2.9"></path>
          <path d="M2 12h4"></path>
          <path d="m4.9 4.9 2.9 2.9"></path>
        </svg>
      </div>
    );
  }
return (
    <AuthContext.Provider value={authMethods}>
      <CustomPropertyProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="flex h-screen">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/callback" element={<Callback />} />
              <Route path="/error" element={<ErrorPage />} />
              <Route path="/prompt-password/:appId/:emailAddress/:provider" element={<PromptPassword />} />
              <Route path="/reset-password/:appId/:fields" element={<ResetPassword />} />
              <Route path="/" element={<Navigate to="/contacts" replace />} />
              <Route 
                path="/contacts" 
                element={<ContactsPage onMobileMenuToggle={handleMobileMenuToggle} />} 
              />
              <Route 
                path="/deals" 
                element={<DealsPage onMobileMenuToggle={handleMobileMenuToggle} />} 
              />
              <Route 
                path="/marketing" 
                element={<MarketingPage onMobileMenuToggle={handleMobileMenuToggle} />} 
              />
              <Route 
                path="/reports" 
                element={<ReportsPage onMobileMenuToggle={handleMobileMenuToggle} />} 
              />
              <Route 
                path="/settings" 
                element={<SettingsPage onMobileMenuToggle={handleMobileMenuToggle} />} 
              />
            </Routes>
          </div>
          <ToastContainer 
            position="top-right" 
            autoClose={3000} 
            hideProgressBar={false} 
            newestOnTop={false} 
            closeOnClick 
            rtl={false} 
            pauseOnFocusLoss 
            draggable 
            pauseOnHover 
            theme="light" 
          />
        </div>
      </CustomPropertyProvider>
    </AuthContext.Provider>
  );
}
function MainApp() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}
export default MainApp;