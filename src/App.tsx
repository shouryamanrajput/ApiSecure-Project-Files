import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import EmailPage from "./pages/EmailPage";
import Settings from "./pages/Settings";
import TestStatus from "./pages/TestStatus";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import OpticalAnimation from "@/components/OpticalAnimation";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOptical, setShowOptical] = useState(true);
  const [showApp, setShowApp] = useState(false);

  const handleAuthSuccess = () => {
    // After auth (including welcome screen), show optical animation
    setIsAuthenticated(true);
    setShowOptical(true);
  };

  const handleOpticalComplete = () => {
    // After animation, show main app
    setShowOptical(false);
    setTimeout(() => {
      setShowApp(true);
    }, 300);
  };

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="safelens-theme">
        <TooltipProvider>
          {/* Auth Screen (includes login and welcome screen) */}
          {!isAuthenticated ? (
            <Auth onAuthSuccess={handleAuthSuccess} />
          ) : (
            <>
              {/* Optical Animation */}
              {showOptical && (
                <div className="transition-all duration-500 ease-out">
                  <OpticalAnimation onComplete={handleOpticalComplete} />
                </div>
              )}
              
              {/* Main App */}
              {!showOptical && (
                <div 
                  className={`transition-all duration-700 ease-out ${
                    showApp ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/email" element={<EmailPage />} />
                    <Route path="/test-history" element={<TestStatus />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              )}
            </>
          )}
          
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
