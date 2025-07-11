import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import EnterResetCode from './pages/Auth/EnterResetCode';
import ResetPassword from './pages/Auth/ResetPassword';
import SuperAdmin from './pages/SuperAdmin/SuperAdmin';
import AdminManager from './pages/SuperAdmin/AdminManager';
import Admin from './pages/Admin/Admin';
import AgentManager from './pages/Admin/AgentManager';
import HomePage from './pages/Home/HomePage';
import AboutPage from './pages/About/AboutPage';
import Evenements from "./pages/SuperAdmin/Evenement/Evenement";
import AgentInterface from './pages/Agent/AgentInterface';


function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/enter-code" element={<EnterResetCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/superadmin" element={<SuperAdmin />} />
        <Route path="/admins" element={<AdminManager />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/agents" element={<AgentManager />} /> 
        <Route path="/about" element={<AboutPage />} />
        <Route path="/evenements" element={<Evenements />} />
        <Route path="/agent-interface/:id" element={<AgentInterface />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;