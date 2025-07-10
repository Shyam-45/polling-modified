import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, Camera, Clock, Filter, User, Building, Phone, Image as ImageIcon } from 'lucide-react';
import { BLO, LocationData } from '../types';
import { apiService } from '../services/api';

interface BLODetailsPageProps {
  bloId: string;
  onBack: () => void;
}

const BLODetailsPage: React.FC<BLODetailsPageProps> = ({ bloId, onBack }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [blo, setBlo] = useState<BLO | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBLOAndData();
  }, [bloId]);

  useEffect(() => {
    if (blo) {
      loadLocationData(currentPage, selectedDate);
    }
  }, [currentPage, selectedDate]);

  const loadBLOAndData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await apiService.getBLODetails(bloId, { 
        page: 1, 
        limit: 20,
        date: selectedDate 
      });
      
      setBlo(data.blo);
      setLocationData(data.locationData || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to load BLO details:', error);
      setError('Failed to load BLO details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadLocationData = async (page: number, date?: string) => {
    try {
      setError('');
      const data = await apiService.getBLODetails(bloId, { 
        page, 
        limit: 20,
        date 
      });
      
      setLocationData(data.locationData || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to load location data:', error);
      setError('Failed to load location data. Please try again.');
    }
  };

  const handleDateFilter = () => {
    setCurrentPage(1);
    loadLocationData(1, selectedDate);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading BLO details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={onBack}
              className="mr-4 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">BLO Details & Location History</h1>
              <p className="text-sm text-gray-600">
                {blo ? `${blo.name} (${blo.userId})` : `BLO ID: ${bloId}`}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* BLO Summary Card */}
        {blo && (
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-8 mb-8 border border-white/20">
            <h3 className="text-xl font-bold text-gray-900 mb-6">BLO Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-start">
                <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Personal Info</p>
                  <p className="text-sm text-gray-900 font-semibold">{blo.name}</p>
                  <p className="text-sm text-gray-600">{blo.designation}</p>
                  <p className="text-sm text-gray-600">{blo.officerType}</p>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <Phone className="h-3 w-3 mr-1" />
                    {blo.mobile}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Building className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">User Details</p>
                  <p className="text-sm text-gray-900 font-mono">{blo.userId}</p>
                  <p className="text-sm text-gray-600">Password: {blo.password}</p>
                  <p className="text-sm text-gray-600">
                    Status: {blo.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Booth Assignment</p>
                  <p className="text-sm text-gray-900 font-semibold">{blo.boothNumber}</p>
                  <p className="text-sm text-gray-600">{blo.boothName}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Camera className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Today's Activity</p>
                  <p className="text-sm text-gray-900 font-semibold">
                    {blo.todayImageCount || 0}/4 images
                  </p>
                  <p className="text-sm text-gray-600">
                    Created: {formatDate(blo.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Date Filter */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Select Date for Location Data
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={handleDateFilter}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Filter className="h-4 w-4 mr-2 inline" />
              Filter by Date
            </button>
          </div>
        </div>

        {/* Location Data Table */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50/80 to-blue-50/80 border-b border-gray-200/50">
            <h3 className="text-lg font-bold text-gray-900">Location Updates</h3>
            <p className="text-sm text-gray-600 mt-1">
              Showing {locationData.length} updates for {formatDate(selectedDate + 'T00:00:00')}
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200/50">
              <thead className="bg-gradient-to-r from-gray-50/80 to-blue-50/80">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-gray-200/30">
                {locationData.length > 0 ? (
                  locationData.map((update) => (
                    <tr key={update._id} className="hover:bg-blue-50/50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p className="font-medium">{formatTime(update.date)}</p>
                            <p className="text-xs text-gray-500">{formatDate(update.date)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          update.type === 'detailed_analysis'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {update.type === 'detailed_analysis' ? (
                            <Camera className="h-3 w-3 mr-1" />
                          ) : (
                            <MapPin className="h-3 w-3 mr-1" />
                          )}
                          {update.type === 'detailed_analysis' ? 'Analysis' : 'Location'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium">{update.location}</p>
                            <p className="text-gray-500 text-xs">
                              Lat: {update.latitude.toFixed(6)}, Lng: {update.longitude.toFixed(6)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {update.imageUrl ? (
                          <div className="flex items-center">
                            <img
                              src={update.imageUrl}
                              alt="Location update"
                              className="h-16 w-16 rounded-lg object-cover mr-3 border border-gray-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                            <div>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Camera className="h-3 w-3 mr-1" />
                                Available
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-500">
                            <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center mr-3 border border-gray-200">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                No image
                              </span>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <MapPin className="h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No location updates found</p>
                        <p className="text-sm">No updates available for {formatDate(selectedDate + 'T00:00:00')}</p>
                      </div>
                    </td>
                  </tr>
                )}
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
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 text-sm font-medium text-gray-700">
                    {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BLODetailsPage;