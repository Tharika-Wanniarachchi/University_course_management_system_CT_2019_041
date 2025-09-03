import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthUser, logoutUser } from '../../api/auth';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getAuthUser();
        // If user is not an admin, redirect to home
        if (response.data.role !== 'admin') {
          navigate('/');
          return;
        }
        setUser(response.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
        if (err.response?.status === 401) {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-800">Admin Portal</h1>
              </div>
            </div>
            <div className="flex items-center">
              {user && (
                <span className="mr-4 text-gray-700">
                  Welcome, {user.name} (Admin)
                </span>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="px-4 py-8 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
              <p className="text-gray-500 text-lg">Admin Dashboard Content</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
