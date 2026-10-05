import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../firebase/store/authStore'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()

  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" />
  return children
}

export default ProtectedRoute