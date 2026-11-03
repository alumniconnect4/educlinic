import React from 'react';
import { StoreProvider } from './store/mockData';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { RightSidebar } from './components/layout/RightSidebar';
import { FeedPage } from './pages/FeedPage';
import { ChatPage } from './pages/ChatPage';
import { ProfilePage } from './pages/ProfilePage';
import { CreatePostPage } from './pages/CreatePostPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { ConnectPage } from './pages/ConnectPage';

import { Routes, Route, Outlet, useLocation } from 'react-router-dom';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const isCreatePost = location.pathname === '/create-post';
  const isPostDetail = location.pathname.startsWith('/post/');
  const isChat = location.pathname === '/chat';
  const isConnect = location.pathname === '/connect';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />

      <div className="container mx-auto max-w-[1280px] px-2 sm:px-4 py-4 flex-1 flex justify-center gap-4">
        {((!isCreatePost && !isPostDetail) || isMobileMenuOpen) && (
          <Sidebar
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            hideOnDesktop={isCreatePost || isPostDetail}
          />
        )}
        <main
          className={`flex-1 min-w-0 ${isCreatePost ? 'max-w-4xl' : isPostDetail || isChat || isConnect ? 'max-w-full' : 'max-w-[680px]'}`}
        >
          <Outlet />
        </main>
        <RightSidebar />
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<FeedPage />} />
        <Route path="connect" element={<ConnectPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="create-post" element={<CreatePostPage />} />
        <Route path="post/:id" element={<PostDetailPage />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;
