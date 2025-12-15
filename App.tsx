
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import ClientLayout from './components/ClientLayout';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import NotFoundPage from './components/NotFoundPage';
import PricingPage from './components/PricingPage';
import PaymentSuccess from './components/PaymentSuccess';
import { AppView, Tool, NewsArticle, UserProfile } from './types';
import { generateDirectoryTools } from './services/geminiService';
import { 
  subscribeToTools, 
  subscribeToNews, 
  addToolToDb, 
  deleteToolFromDb, 
  updateToolInDb,
  addNewsToDb, 
  deleteNewsFromDb, 
  updateNewsInDb
} from './services/dbService';
import { isSupabaseConfigured, supabase } from './services/supabase';
import { getCurrentUserProfile, signOut } from './services/authService';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Data State
  const [tools, setTools] = useState<Tool[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [dbError, setDbError] = useState(false);

  // Check for API Key (AI Studio environment)
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
       setDbError(true);
       checkApiKeyAndLoadLocal();
       return;
    }

    // Auth Subscription
    const checkUser = async () => {
        const profile = await getCurrentUserProfile();
        setUser(profile);
    };
    checkUser();

    // Listen for Auth changes (Login/Logout)
    const { data: authListener } = supabase?.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            const profile = await getCurrentUserProfile();
            setUser(profile);
        } else if (event === 'SIGNED_OUT') {
            setUser(null);
        }
    }) || { data: { subscription: { unsubscribe: () => {} } } };


    // Subscribe to Realtime Data
    const unsubscribeTools = subscribeToTools(
        (data) => {
            setTools(data);
        },
        (error) => {
            console.error("DB Error (Tools):", error);
            setDbError(true);
            loadToolsLocally();
        }
    );

    const unsubscribeNews = subscribeToNews(
        (data) => {
            setNews(data);
        },
        (error) => {
            console.error("DB Error (News):", error);
            // Optionally load dummy news or just handle silently
        }
    );

    // Check API Key for AI Studio features
    checkApiKeyAndLoadLocal();

    return () => {
        unsubscribeTools();
        unsubscribeNews();
        authListener.subscription.unsubscribe();
    };
  }, []);

  const checkApiKeyAndLoadLocal = async () => {
      // Logic for AI Studio Env
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(hasKey);
          if (hasKey && !isSupabaseConfigured) {
              loadToolsLocally();
          }
      } else {
          // Normal env or fallback
          setHasApiKey(true); 
          if (!isSupabaseConfigured) loadToolsLocally();
      }
  };

  const loadToolsLocally = async () => {
    // Used for demo mode when DB is not connected
    try {
      const newTools = await generateDirectoryTools();
      // Ensure we don't duplicate if called multiple times or on top of existing data if needed
      setTools(prev => {
          if (prev.length > 0) return prev; // Don't overwrite if we have data
          return newTools;
      });
    } catch (e) {
      console.error("Failed to load tools", e);
    }
  };

  const handleAuthSuccess = async () => {
      const profile = await getCurrentUserProfile();
      setUser(profile);
  };

  const handleLogout = async () => {
      try {
          await signOut();
          setUser(null); // Explicitly clear user state for demo users
      } catch (e) {
          console.error("Logout failed", e);
      }
  };

  const handleAddTool = async (tool: Tool) => {
    try {
        if (isSupabaseConfigured) {
            await addToolToDb(tool);
        } else {
            setTools(prev => [tool, ...prev]);
        }
    } catch (e: any) {
        console.error("Error adding tool", e);
        alert(`Failed to save tool: ${e.message}`);
    }
  };

  const handleUpdateTool = async (id: string, tool: Tool) => {
    try {
        if (isSupabaseConfigured) {
            await updateToolInDb(id, tool);
        } else {
            setTools(prev => prev.map(t => t.id === id ? { ...tool, id } : t));
        }
    } catch (e: any) {
        console.error("Error updating tool", e);
        alert(`Failed to update tool: ${e.message}`);
    }
  };

  const handleAddNews = async (article: NewsArticle) => {
    try {
        if (isSupabaseConfigured) {
            await addNewsToDb(article);
        } else {
            setNews(prev => [article, ...prev]);
        }
    } catch (e: any) {
        console.error("Error adding news", e);
        alert(`Failed to save news: ${e.message}`);
    }
  };

  const handleUpdateNews = async (id: string, article: NewsArticle) => {
    try {
        if (isSupabaseConfigured) {
            await updateNewsInDb(id, article);
        } else {
            setNews(prev => prev.map(n => n.id === id ? { ...article, id } : n));
        }
    } catch (e: any) {
        console.error("Error updating news", e);
        alert(`Failed to update news: ${e.message}`);
    }
  };
  
  const handleDeleteTool = async (id: string) => {
    console.log("Deleting tool:", id);
    // Optimistic Update
    const previousTools = [...tools];
    setTools(prev => prev.filter(t => t.id !== id));

    if (isSupabaseConfigured) {
        try {
            await deleteToolFromDb(id);
        } catch (error: any) {
            console.error("Delete failed:", error);
            alert(`Failed to delete tool from database: ${error.message}.`);
            setTools(previousTools); 
        }
    }
  };

  const handleDeleteNews = async (id: string) => {
    console.log("Deleting news:", id);
    // Optimistic Update
    const previousNews = [...news];
    setNews(prev => prev.filter(n => n.id !== id));

    if (isSupabaseConfigured) {
        try {
            await deleteNewsFromDb(id);
        } catch (error: any) {
            console.error("Delete failed:", error);
            alert(`Failed to delete article from database: ${error.message}.`);
            setNews(previousNews);
        }
    }
  };

  // Reusable Main App Layout to avoid duplication in routes
  const mainApp = (
    <ClientLayout
         user={user}
         tools={tools}
         news={news}
         hasApiKey={hasApiKey}
         setHasApiKey={setHasApiKey}
         isAuthModalOpen={isAuthModalOpen}
         setIsAuthModalOpen={setIsAuthModalOpen}
         onLogoutClick={handleLogout}
         dbError={dbError}
         onUpdateNews={handleUpdateNews}
    />
  );

  return (
    <HashRouter>
      <Routes>
        <Route path="/admin" element={
            user?.role === 'admin' ? (
               <AdminDashboard 
                  tools={tools} 
                  news={news}
                  user={user}
                  onAddTool={handleAddTool} 
                  onUpdateTool={handleUpdateTool}
                  onAddNews={handleAddNews} 
                  onUpdateNews={handleUpdateNews}
                  onDeleteTool={handleDeleteTool}
                  onDeleteNews={handleDeleteNews}
                  onBack={() => {}} 
               />
            ) : (
                <div className="flex items-center justify-center h-screen bg-black text-white">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
                    <p className="mb-4 text-zinc-400">Please log in as an administrator to access this page.</p>
                    <a href="/" className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-500">Go to Home</a>
                  </div>
                </div>
            )
        } />
        
        {/* Payment Success Route */}
        <Route path="/payment-success" element={<PaymentSuccess />} />

        {/* Pricing Route */}
        <Route path="/pricing" element={<PricingPage user={user} onLoginRequest={() => setIsAuthModalOpen(true)} />} />

        {/* Main App Routes */}
        <Route path="/" element={
            <>
               {mainApp}
               <AuthModal 
                 isOpen={isAuthModalOpen} 
                 onClose={() => setIsAuthModalOpen(false)} 
                 onSuccess={handleAuthSuccess}
               />
            </>
        } />
        <Route path="/news/*" element={
            <>
               {mainApp}
               <AuthModal 
                 isOpen={isAuthModalOpen} 
                 onClose={() => setIsAuthModalOpen(false)} 
                 onSuccess={handleAuthSuccess}
               />
            </>
        } />
        
        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
