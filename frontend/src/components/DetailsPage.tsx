import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, Camera, Clock, Filter, User, Building, Phone } from 'lucide-react';
import { LocationUpdate, Employee } from '../types';
import { apiService } from '../services/api';

interface DetailsPageProps {
  empId: string;
  onBack: () => void;
}

const DetailsPage: React.FC<DetailsPageProps> = ({ empId, onBack }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [locationUpdates, setLocationUpdates] = useState<LocationUpdate[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEmployeeAndUpdates();
  }, [empId]);

  const loadEmployeeAndUpdates = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load employee details and today's location updates
      const [employeeData, updatesData] = await Promise.all([
        apiService.getEmployee(empId),
        apiService.getLocationUpdates(empId, selectedDate)
      ]);
      
      setEmployee(employeeData);
      setLocationUpdates(updatesData.results || updatesData);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load employee details and location updates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadLocationUpdates = async (date?: string) => {
    try {
      setError('');
      const data = await apiService.getLocationUpdates(empId, date || selectedDate);
      setLocationUpdates(data.results || data);
    } catch (error) {
      console.error('Failed to load location updates:', error);
      setError('Failed to load location updates. Please try again.');
    }
  };

  const handleDateFilter = () => {
    loadLocationUpdates(selectedDate);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employee details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={onBack}
              className="mr-4 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Employee Details & Location Updates</h1>
              <p className="text-sm text-gray-600">
                {employee ? `${employee.name} (${employee.emp_id})` : `Employee ID: ${empId}`}
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

        {/* Employee Summary Card */}
        {employee && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-start">
                <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Personal Info</p>
                  <p className="text-sm text-gray-900">{employee.name || 'Not assigned'}</p>
                  <p className="text-sm text-gray-600">{employee.designation || 'Not assigned'}</p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    {employee.mobile_number || 'Not assigned'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Building className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Office Assignment</p>
                  <p className="text-sm text-gray-900">{employee.office_name || 'Not assigned'}</p>
                  <p className="text-sm text-gray-600">{employee.office_place || 'Not assigned'}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Booth Assignment</p>
                  <p className="text-sm text-gray-900">{employee.booth_number || 'Not assigned'} - {employee.booth_name || 'Not assigned'}</p>
                  <p className="text-sm text-gray-600">{employee.building_name || 'Not assigned'}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Schedule & Ward</p>
                  <p className="text-sm text-gray-900">{employee.booth_duration || 'Not assigned'}</p>
                  <p className="text-sm text-gray-600">Ward: {employee.ward_number || 'Not assigned'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Date Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Select Date for Location Updates
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

        {/* Location Updates Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Location Updates</h3>
            <p className="text-sm text-gray-600 mt-1">
              Showing {locationUpdates.length} updates for {formatDate(selectedDate + 'T00:00:00')}
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serial No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location Update
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {locationUpdates.length > 0 ? (
                  locationUpdates.map((update) => (
                    <tr key={update.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                          {update.serial_number}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p className="font-medium">{formatTime(update.timestamp)}</p>
                            <p className="text-xs text-gray-500">{formatDate(update.timestamp)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium">{update.place_name}</p>
                            <p className="text-gray-500 text-xs">{update.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {update.image ? (
                          <div className="flex items-center">
                            <img
                              src={update.image}
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
                              <Camera className="h-6 w-6 text-gray-400" />
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
        </div>
      </main>
    </div>
  );
};

export default DetailsPage;