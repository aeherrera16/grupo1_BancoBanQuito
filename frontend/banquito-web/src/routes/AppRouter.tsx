import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/DashboardPage';
export default function AppRouter(){const {session}=useAuth(); return session?<DashboardPage/>:<LoginPage/>}
