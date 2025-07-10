import React, { useState, useEffect } from 'react';
import { Search, Filter, LogOut, Eye, Users, MapPin, Camera, TrendingUp, Activity, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { BLO, DashboardStats, Admin } from '../types';
import { apiService } from '../services/api';

interface AdminDashboardProps {
  admin: Admin;
  onLogout: () => void;
  onViewBLODetails: (bloId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin, onLogout, onViewBLODetails }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'blos'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [imageCountFilter, setImageCountFilter] = useState<number | ''>('');
  const [blos, setBlos] = useState<BLO[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalBLOs: 0,
    totalTestUsers: 0,
    todayLocationUpdates: 0,
    todayImageUploads: 0,
    imageDistribution: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 }
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'blos') {
      loadBLOs(currentPage);
    }
  }, [activeTab, currentPage]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const statsData = await apiService.getDashboardStats();
      setStats(statsData.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadBLOs = async (page: number, search?: string, imageCount?: number) => {
    try {
      setError('');
      const params: { page: number; limit: number; search?: string; imageCount?: number } = { 
        page, 
        limit: 20 
      };
      
      if (search?.trim()) params.search = search.trim();
      if (imageCount !== undefined) params.imageCount = imageCount;

      const data = await apiService.getAllBLOs(params);
      setBlos(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to load BLOs:', error);
      setError('Failed to load BLOs. Please try again.');
    }
  };

  const handleSearch = async () => {
    try {
      setSearchLoading(true);
      setError('');
      setCurrentPage(1);
      await loadBLOs(1, searchTerm, imageCountFilter === '' ? undefined : imageCountFilter);
    } catch (error) {
      console.error('Search failed:', error);
      setError('Search failed. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleReset = async () => {
    setSearchTerm('');
    setImageCountFilter('');
    setCurrentPage(1);
    setError('');
    await loadBLOs(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-700 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  BLO Monitoring Dashboard
                </h1>
                <p className="text-sm text-gray-600 font-medium">Admin Control Panel</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-lg border border-blue-200">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Welcome, {admin.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="group inline-flex items-center px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white/70 hover:bg-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 backdrop-blur-sm"
              >
                <LogOut className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white/70 backdrop-blur-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Activity className="h-4 w-4 mr-2 inline" />
              Dashboard Overview
            </button>
            <button
              onClick={() => setActiveTab('blos')}
              className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-200 ${
                activeTab === 'blos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4 mr-2 inline" />
              Know Your BLO
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-400 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="h-5 w-5 text-red-400 mr-3">⚠️</div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total BLOs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalBLOs}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Test Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalTestUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Today's Updates</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.todayLocationUpdates}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Today's Images</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.todayImageUploads}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Distribution Chart */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Today's Image Upload Distribution</h3>
              <div className="grid grid-cols-5 gap-4">
                {Object.entries(stats.imageDistribution).map(([count, users]) => (
                  <div key={count} className="text-center">
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4 border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">{users}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {count} image{count !== '1' ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'blos' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
              <div className="flex flex-col lg:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-2">
                    Search BLOs
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="search"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Search by name, user ID, or booth number..."
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label htmlFor="imageCount" className="block text-sm font-semibold text-gray-700 mb-2">
                    Filter by Image Count
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Filter className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="imageCount"
                      value={imageCountFilter}
                      onChange={(e) => setImageCountFilter(e.target.value === '' ? '' : parseInt(e.target.value))}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      <option value="">All Image Counts</option>
                      <option value="0">0 Images</option>
                      <option value="1">1 Image</option>
                      <option value="2">2 Images</option>
                      <option value="3">3 Images</option>
                      <option value="4">4 Images</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={handleSearch}
                    disabled={searchLoading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {searchLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Searching...
                      </div>
                    ) : (
                      'Search'
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* BLO Table */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50/80 to-blue-50/80 border-b border-gray-200/50">
                <h3 className="text-lg font-bold text-gray-900">BLO Directory</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Showing {blos.length} BLOs (Page {currentPage} of {totalPages})
                </p>
              </div>
              
              {blos.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200/50">
                      <thead className="bg-gradient-to-r from-gray-50/80 to-blue-50/80">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Name & ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Designation
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Mobile
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Booth Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Today's Images
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white/50 divide-y divide-gray-200/30">
                        {blos.map((blo) => (
                          <tr key={blo._id} className="hover:bg-blue-50/50 transition-all duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{blo.name}</div>
                                <div className="text-sm text-gray-500">{blo.userId}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm text-gray-900">{blo.designation}</div>
                                <div className="text-sm text-gray-500">{blo.officerType}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                              {blo.mobile}
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{blo.boothNumber}</div>
                                <div className="text-sm text-gray-500">{blo.boothName}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                (blo.todayImageCount || 0) === 4 
                                  ? 'bg-green-100 text-green-800' 
                                  : (blo.todayImageCount || 0) >= 2 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                <Camera className="h-3 w-3 mr-1" />
                                {blo.todayImageCount || 0}/4
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <button
                                onClick={() => onViewBLODetails(blo._id)}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50/80 to-blue-50/80 border-t border-gray-200/50">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <span className="px-3 py-2 text-sm font-medium text-gray-700">
                            {currentPage}
                          </span>
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="px-6 py-12 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No BLOs found</h3>
                  <p className="text-gray-500">Try adjusting your search criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;