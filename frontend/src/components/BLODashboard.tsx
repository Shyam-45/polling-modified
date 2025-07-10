import React, { useState, useEffect, useRef } from 'react';
import { LogOut, MapPin, Camera, User, Clock, Upload, CheckCircle, AlertCircle, History, Image as ImageIcon } from 'lucide-react';
import { User as UserType, LocationData } from '../types';
import { apiService } from '../services/api';

interface BLODashboardProps {
  user: UserType;
  onLogout: () => void;
}

const BLODashboard: React.FC<BLODashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'location' | 'analysis' | 'history'>('profile');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState<UserType | null>(null);
  const [history, setHistory] = useState<LocationData[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const loadUserProfile = async () => {
    try {
      const response = await apiService.getUserProfile();
      setUserProfile(response.user);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setError('Failed to load user profile');
    }
  };

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await apiService.getUserHistory({ limit: 50 });
      setHistory(response.data || []);
    } catch (error) {
      console.error('Failed to load history:', error);
      setError('Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(new Error('Failed to get location: ' + error.message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  const handleSendLocation = async () => {
    try {
      setLocationLoading(true);
      setError('');
      setUploadSuccess(false);

      const location = await getCurrentLocation();
      setLatitude(location.latitude);
      setLongitude(location.longitude);

      await apiService.sendLocation(location.latitude, location.longitude);
      setUploadSuccess(true);
      
      // Refresh profile to update image count
      await loadUserProfile();
    } catch (error: any) {
      console.error('Failed to send location:', error);
      setError(error.message || 'Failed to send location');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendAnalysis = async () => {
    try {
      setAnalysisLoading(true);
      setError('');
      setUploadSuccess(false);

      if (!selectedImage) {
        setError('Please select an image first');
        return;
      }

      const location = await getCurrentLocation();
      setLatitude(location.latitude);
      setLongitude(location.longitude);

      // Upload image to external service
      const imageUrl = await apiService.uploadImageToExternalService(selectedImage);
      
      // Send detailed analysis
      const response = await apiService.sendDetailedAnalysis(location.latitude, location.longitude, imageUrl);
      setUploadSuccess(true);
      
      // Clear image selection
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh profile to update image count
      await loadUserProfile();
      
      // Show remaining images info
      if (response.remainingImages !== undefined) {
        setError(`Success! You can send ${response.remainingImages} more images today.`);
      }
    } catch (error: any) {
      console.error('Failed to send analysis:', error);
      setError(error.message || 'Failed to send detailed analysis');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <User className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  BLO Dashboard
                </h1>
                <p className="text-sm text-gray-600 font-medium">{user.name} ({user.userId})</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-lg border border-green-200">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  Images: {userProfile?.todayImageCount || 0}/4
                </span>
              </div>
              <button
                onClick={onLogout}
                className="group inline-flex items-center px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white/70 hover:bg-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 backdrop-blur-sm"
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
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'location', label: 'Send Location', icon: MapPin },
              { id: 'analysis', label: 'Detailed Analysis', icon: Camera },
              { id: 'history', label: 'History', icon: History }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-200 ${
                  activeTab === id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2 inline" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error/Success Messages */}
        {error && (
          <div className={`mb-6 border-l-4 rounded-lg p-4 ${
            uploadSuccess ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'
          }`}>
            <div className="flex items-center">
              {uploadSuccess ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              )}
              <span className={`text-sm font-medium ${
                uploadSuccess ? 'text-green-700' : 'text-red-700'
              }`}>
                {error}
              </span>
            </div>
          </div>
        )}

        {activeTab === 'profile' && userProfile && (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                    <p className="text-gray-900 bg-gray-50 rounded-lg p-3">{userProfile.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">User ID</label>
                    <p className="text-gray-900 bg-gray-50 rounded-lg p-3 font-mono">{userProfile.userId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Designation</label>
                    <p className="text-gray-900 bg-gray-50 rounded-lg p-3">{userProfile.designation}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Officer Type</label>
                    <p className="text-gray-900 bg-gray-50 rounded-lg p-3">{userProfile.officerType}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number</label>
                    <p className="text-gray-900 bg-gray-50 rounded-lg p-3 font-mono">{userProfile.mobile}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Booth Number</label>
                    <p className="text-gray-900 bg-gray-50 rounded-lg p-3">{userProfile.boothNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Booth Name</label>
                    <p className="text-gray-900 bg-gray-50 rounded-lg p-3">{userProfile.boothName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Today's Images</label>
                    <p className="text-gray-900 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 font-bold">
                      {userProfile.todayImageCount || 0}/4 images uploaded
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'location' && (
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Send Location Only</h3>
              <div className="text-center">
                <div className="mb-6">
                  <MapPin className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Click the button below to send your current location to the admin dashboard.
                  </p>
                </div>
                
                {latitude && longitude && (
                  <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700">
                      <strong>Current Location:</strong> {latitude.toFixed(6)}, {longitude.toFixed(6)}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleSendLocation}
                  disabled={locationLoading}
                  className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {locationLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Sending Location...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-5 w-5 mr-3" />
                      Send My Location
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Send Detailed Analysis</h3>
              
              {(userProfile?.todayImageCount || 0) >= 4 ? (
                <div className="text-center py-8">
                  <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Daily Limit Reached</h4>
                  <p className="text-gray-600">
                    You have already uploaded 4 images today. Please try again tomorrow.
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-6">
                    <div className="mx-auto h-48 w-full max-w-sm bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-6 border-2 border-dashed border-green-300 overflow-hidden">
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Selected image" 
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="h-16 w-16 text-green-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">No image selected</p>
                        </div>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />

                    <div className="space-y-4">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <ImageIcon className="h-5 w-5 mr-3" />
                        {selectedImage ? 'Change Image' : 'Select Image'}
                      </button>

                      {selectedImage && (
                        <button
                          onClick={handleSendAnalysis}
                          disabled={analysisLoading}
                          className="w-full inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {analysisLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                              Uploading Analysis...
                            </>
                          ) : (
                            <>
                              <Upload className="h-5 w-5 mr-3" />
                              Send Detailed Analysis
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="mt-6 text-sm text-gray-600">
                      <p>
                        Remaining uploads today: <strong>{4 - (userProfile?.todayImageCount || 0)}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50/80 to-green-50/80 border-b border-gray-200/50">
                <h3 className="text-lg font-bold text-gray-900">Upload History</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your recent location updates and image uploads
                </p>
              </div>
              
              {historyLoading ? (
                <div className="px-6 py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading history...</p>
                </div>
              ) : history.length > 0 ? (
                <div className="divide-y divide-gray-200/50">
                  {history.map((item) => (
                    <div key={item._id} className="px-6 py-4 hover:bg-green-50/50 transition-colors duration-200">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-lg ${
                          item.type === 'detailed_analysis' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {item.type === 'detailed_analysis' ? (
                            <Camera className="h-5 w-5" />
                          ) : (
                            <MapPin className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">
                              {item.type === 'detailed_analysis' ? 'Detailed Analysis' : 'Location Update'}
                            </h4>
                            <span className="text-xs text-gray-500">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {formatDate(item.date)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Location: {item.location}
                          </p>
                          {item.imageUrl && (
                            <div className="mt-2">
                              <img 
                                src={item.imageUrl} 
                                alt="Upload" 
                                className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No history found</h3>
                  <p className="text-gray-500">Start uploading locations and images to see your history here.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BLODashboard;