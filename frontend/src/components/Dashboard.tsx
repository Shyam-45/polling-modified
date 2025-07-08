import React, { useState, useEffect } from 'react';
import { Search, Filter, LogOut, Eye, Users, MapPin, Clock, ExternalLink, TrendingUp, Activity, Shield, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Employee } from '../types';
import { apiService } from '../services/api';

interface DashboardProps {
  user: { username: string; role: string };
  onLogout: () => void;
  onViewDetails: (empId: string) => void;
}

interface DashboardStats {
  total_employees: number;
  active_booths: number;
  on_duty: number;
}

interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
  current_page: number;
  total_pages: number;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [wards, setWards] = useState<string[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_employees: 0,
    active_booths: 0,
    on_duty: 0
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    count: 0,
    next: null,
    previous: null,
    current_page: 1,
    total_pages: 1
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadEmployees(currentPage);
  }, [currentPage]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [wardsData, statsData] = await Promise.all([
        apiService.getWards(),
        apiService.getDashboardStats()
      ]);

      setWards(wardsData.map((ward: any) => ward.ward_number));
      setStats(statsData);
      
      // Load first page of employees
      await loadEmployees(1);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async (page: number, search?: string, ward?: string) => {
    try {
      setError('');
      const params: { search?: string; ward?: string; page?: number } = { page };
      if (search?.trim()) params.search = search.trim();
      if (ward) params.ward = ward;

      const data = await apiService.getEmployees(params);
      setEmployees(data.results || []);
      
      // Update pagination info
      setPagination({
        count: data.count || 0,
        next: data.next,
        previous: data.previous,
        current_page: page,
        total_pages: Math.ceil((data.count || 0) / 60)
      });
    } catch (error) {
      console.error('Failed to load employees:', error);
      setError('Failed to load employees. Please try again.');
    }
  };

  const handleSearch = async () => {
    try {
      setSearchLoading(true);
      setError('');
      setCurrentPage(1);
      await loadEmployees(1, searchTerm, selectedWard);
    } catch (error) {
      console.error('Search failed:', error);
      setError('Search failed. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleReset = async () => {
    setSearchTerm('');
    setSelectedWard('');
    setCurrentPage(1);
    setError('');
    await loadEmployees(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.total_pages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const totalPages = pagination.total_pages;
    const current = currentPage;
    
    // Always show first page
    if (totalPages > 0) pages.push(1);
    
    // Show pages around current page
    const start = Math.max(2, current - 2);
    const end = Math.min(totalPages - 1, current + 2);
    
    // Add ellipsis if needed
    if (start > 2) pages.push('...');
    
    // Add pages around current
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }
    
    // Add ellipsis if needed
    if (end < totalPages - 1) pages.push('...');
    
    // Always show last page
    if (totalPages > 1) pages.push(totalPages);
    
    return pages;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-purple-400 animate-pulse mx-auto"></div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">Loading dashboard...</p>
          <p className="text-sm text-gray-500">Fetching employee data and statistics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="relative">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Polling Station Dashboard
                </h1>
                <p className="text-sm text-gray-600 font-medium">Real-time Employee Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-lg border border-blue-200">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Welcome, {user.username}</span>
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

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="group relative bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="ml-6">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total_employees}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center">
              <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div className="ml-6">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Booths</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.active_booths}</p>
                <div className="flex items-center mt-2">
                  <Activity className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">Operational</span>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center">
              <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div className="ml-6">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">On Duty</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.on_duty}</p>
                <div className="flex items-center mt-2">
                  <Clock className="h-4 w-4 text-orange-500 mr-1" />
                  <span className="text-sm text-orange-600 font-medium">Monitoring</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filter */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-8 mb-8 border border-white/20">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Search & Filter Employees</h3>
            <p className="text-sm text-gray-600">Find employees by ID, name, or filter by ward assignment</p>
          </div>
          <div className="flex flex-col lg:flex-row gap-6 items-end">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-3">
                Search by Employee ID or Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-sm"
                  placeholder="Enter Employee ID (e.g., EMP001) or Name..."
                />
              </div>
            </div>
            <div className="flex-1">
              <label htmlFor="ward" className="block text-sm font-semibold text-gray-700 mb-3">
                Filter by Ward Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="ward"
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white/80 backdrop-blur-sm text-gray-900 shadow-sm"
                >
                  <option value="">All Wards</option>
                  {wards.map(ward => (
                    <option key={ward} value={ward}>{ward}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleSearch}
                disabled={searchLoading}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Employee Table */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50/80 to-blue-50/80 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Employee Directory</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Showing <span className="font-semibold text-blue-600">{employees.length}</span> of <span className="font-semibold">{pagination.count}</span> employees
                  {pagination.total_pages > 1 && (
                    <span className="ml-2">
                      (Page <span className="font-semibold text-purple-600">{currentPage}</span> of <span className="font-semibold">{pagination.total_pages}</span>)
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-600">Live Data</span>
              </div>
            </div>
          </div>
          
          {employees.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200/50">
                  <thead className="bg-gradient-to-r from-gray-50/80 to-blue-50/80">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Emp ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Designation
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Mobile Number
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Office
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Booth
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Duration / Building
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Ward
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 divide-y divide-gray-200/30">
                    {employees.map((employee, index) => (
                      <tr key={employee.emp_id} className="hover:bg-blue-50/50 transition-all duration-200 group">
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-blue-600">
                          <div className="flex items-center">
                            <div className="h-2 w-2 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-600 transition-colors duration-200"></div>
                            {employee.emp_id}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900">
                          {employee.name || <span className="text-gray-400 italic">Not assigned</span>}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700">
                          {employee.designation || <span className="text-gray-400 italic">Not assigned</span>}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700 font-mono">
                          {employee.mobile_number || <span className="text-gray-400 italic">Not assigned</span>}
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-700">
                          <div>
                            <p className="font-semibold text-gray-900">{employee.office_name || 'Not assigned'}</p>
                            <p className="text-gray-500 text-xs">{employee.office_place || 'Not assigned'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-700">
                          <div>
                            <p className="font-semibold text-gray-900">{employee.booth_number || 'Not assigned'} - {employee.booth_name || 'Not assigned'}</p>
                            <p className="text-gray-500 text-xs">{employee.building_name || 'Not assigned'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-700">
                          <div>
                            <p className="font-semibold text-gray-900">{employee.booth_duration || 'Not assigned'}</p>
                            <p className="text-gray-500 text-xs">{employee.building_name || 'Not assigned'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200">
                            {employee.ward_number || 'Not assigned'}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => onViewDetails(employee.emp_id)}
                            className="group inline-flex items-center px-4 py-2 border border-transparent text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          >
                            <ExternalLink className="h-3 w-3 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Enhanced Pagination */}
              {pagination.total_pages > 1 && (
                <div className="px-8 py-6 bg-gradient-to-r from-gray-50/80 to-blue-50/80 border-t border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="font-medium">
                        Showing {((currentPage - 1) * 60) + 1} to {Math.min(currentPage * 60, pagination.count)} of {pagination.count} employees
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* First Page */}
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        title="First Page"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </button>

                      {/* Previous Page */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        title="Previous Page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center space-x-1">
                        {getPageNumbers().map((page, index) => (
                          <React.Fragment key={index}>
                            {page === '...' ? (
                              <span className="px-3 py-2 text-gray-500">...</span>
                            ) : (
                              <button
                                onClick={() => handlePageChange(page as number)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                  currentPage === page
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                    : 'border border-gray-300 text-gray-700 hover:bg-white hover:shadow-md'
                                }`}
                              >
                                {page}
                              </button>
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Next Page */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.total_pages}
                        className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        title="Next Page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>

                      {/* Last Page */}
                      <button
                        onClick={() => handlePageChange(pagination.total_pages)}
                        disabled={currentPage === pagination.total_pages}
                        className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        title="Last Page"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="px-8 py-16 text-center">
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {pagination.count === 0 ? 'No employees found' : 'No matching employees'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {pagination.count === 0 
                    ? 'Add employees to get started with the management system.' 
                    : 'Try adjusting your search criteria or reset the filters.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;