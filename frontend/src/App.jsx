import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Footer from './components/Footer';
import CategoryPage from './pages/CategoryPage';
import PostPage from './pages/PostPage';
import NewPost from './pages/admin/NewPost';
import Dashboard from './pages/admin/Dashboard';
import EditAccount from './pages/admin/EditAccount';
import EditPost from './pages/admin/EditPost';
import AllPosts from './pages/AllPosts';
import UserDashboard from './pages/UserDashboard'; // adjust path if needed
import RrethNesh from './pages/RrethNesh';
import Kontakt from './pages/Kontakt';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';



function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/category/:name" element={<CategoryPage />} />
          <Route path="/posts/:id" element={<PostPage />} />
          <Route path="/admin/new-post" element={<NewPost />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/edit-account" element={<EditAccount />} />
          <Route path="/edit-account" element={<EditAccount />} />
          <Route path="/edit-post/:id" element={<EditPost />} />
          <Route path="/all" element={<AllPosts />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/rreth-nesh" element={<RrethNesh />} />
          <Route path="/contact" element={<Kontakt />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
