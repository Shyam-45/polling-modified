import React, { useState, useEffect, useRef } from 'react';
import { Phone, User, Camera, MapPin, Clock, Upload, CheckCircle, AlertCircle, Home, Building, Shield, Activity, Image as ImageIcon } from 'lucide-react';
import { Employee } from '../types';
import { apiService } from '../services/api';

interface MobileAppProps {
  onLoginWithMobile: (mobileNumber: string) => Promise<boolean>;
  user: { username: string; role: string } | null;
}

const MobileApp: React.FC<MobileAppProps> = ({ onLoginWithMobile, user }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'upload'>('details');
  const [locationTracking, setLocationTracking] = useState(false);
  const [lastImageUpload, setLastImageUpload] = useState<Date | null>(null);
  const [employeeDetails, setEmployeeDetails] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if we have employee data from mobile login
    const storedEmployee = localStorage.getItem('employee');
    if (storedEmployee) {
      const employee = JSON.parse(storedEmployee);
      loadEmployeeDetails(employee.mobile_number);
    } else if (user && user.role === 'employee') {
      // Try to load by user's mobile number if available
      loadEmployeeDetails(user.username);
    }
  }, [user]);

  const loadEmployeeDetails = async (mobileNumber: string) => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getEmployeeByMobile(mobileNumber);
      setEmployeeDetails(data);
    } catch (error) {
      console.error('Failed to load employee details:', error);
      setError('Failed to load employee details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMobileLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (mobileNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setLoading(true);
      const success = await onLoginWithMobile(mobileNumber);
      if (success) {
        // Load employee details after successful login
        await loadEmployeeDetails(mobileNumber);
      } else {
        setError('Mobile number not found in employee records');
      }
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    if (!employeeDetails) {
      setError('Employee details not loaded');
      return;
    }

    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setUploadLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Upload image to external service and get URL
          const imageUrl = await apiService.uploadImageToExternalService(selectedImage);
          
          // Create location update with image URL
          await apiService.createLocationUpdate({
            latitude,
            longitude,
            place_name: `${employeeDetails.booth_name || 'Location'}, ${employeeDetails.office_place || 'Office'}`,
            image_url: imageUrl
          });
          
          setLastImageUpload(new Date());
          setSelectedImage(null);
          setImagePreview(null);
          
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          console.error('Failed to upload image:', error);
          setError('Failed to upload image. Please try again.');
        } finally {
          setUploadLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Failed to get location. Please enable location services.');
        setUploadLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    return hours >= 9 && hours < 17; // 9 AM to 5 PM
  };

  const startLocationTracking = async () => {
    if (!getCurrentTime()) {
      setError('Location tracking is only active during duty hours (9 AM - 5 PM)');
      return;
    }
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    if (!employeeDetails) {
      setError('Employee details not loaded');
      return;
    }

    setLocationTracking(true);
    setError('');
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          await apiService.createLocationUpdate({
            latitude,
            longitude,
            place_name: `${employeeDetails.booth_name || 'Location'}, ${employeeDetails.office_place || 'Office'}`
          });
        } catch (error) {
          console.error('Failed to update location:', error);
          setError('Failed to update location. Please try again.');
        } finally {
          setLocationTracking(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Failed to get location. Please enable location services.');
        setLocationTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const goToDashboard = () => {
    window.location.href = '/';
  };

  // Show login form if no employee details
  if (!employeeDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="relative mx-auto h-20 w-20 mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Phone className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-green-400 rounded-full border-2 border-white animate-pulse flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-full"></div>
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Employee Mobile Access
            </h2>
            <p className="mt-3 text-gray-600 font-medium">
              Enter your mobile number to access your profile
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleMobileLogin}>
            <div>
              <label htmlFor="mobile" className="block text-sm font-semibold text-gray-700 mb-3">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-sm"
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                  <span className="text-red-700 text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-6 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Accessing Profile...
                  </div>
                ) : (
                  'Access Employee Profile'
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={goToDashboard}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Admin Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-purple-400 animate-pulse mx-auto"></div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">Loading employee profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <User className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Employee Mobile App
                </h1>
                <p className="text-sm text-gray-600 font-medium">{employeeDetails?.name || 'Loading...'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-blue-50 px-3 py-2 rounded-lg border border-green-200">
                <div className={`h-2 w-2 rounded-full ${getCurrentTime() ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-xs font-semibold text-gray-700">
                  {getCurrentTime() ? 'On Duty' : 'Off Duty'}
                </span>
              </div>
              <button
                onClick={goToDashboard}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white/70 rounded-lg transition-all duration-200 backdrop-blur-sm"
                title="Go to Dashboard"
              >
                <Home className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white/70 backdrop-blur-lg border-b border-gray-200/50">
        <div className="px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-200 ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User className="h-4 w-4 mr-2 inline" />
              Employee Details
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-200 ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Camera className="h-4 w-4 mr-2 inline" />
              Location & Images
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <span className="text-red-700 text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {activeTab === 'details' && employeeDetails && (
          <div className="space-y-6">
            {/* Personal Info Card */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg mr-4">
                  <User className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Employee ID</label>
                  <p className="text-lg font-bold text-blue-600">{employeeDetails.emp_id}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                  <p className="text-sm text-gray-900 font-medium">{employeeDetails.name || 'Not assigned'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Designation</label>
                  <p className="text-sm text-gray-900 font-medium">{employeeDetails.designation || 'Not assigned'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number</label>
                  <p className="text-sm text-gray-900 font-mono font-medium">{employeeDetails.mobile_number || 'Not assigned'}</p>
                </div>
              </div>
            </div>

            {/* Office Details Card */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg mr-4">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Office Assignment</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Office Name</label>
                  <p className="text-sm text-gray-900 font-medium">{employeeDetails.office_name || 'Not assigned'}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Office Location</label>
                  <p className="text-sm text-gray-900 font-medium">{employeeDetails.office_place || 'Not assigned'}</p>
                </div>
              </div>
            </div>

            {/* Booth Details Card */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg mr-4">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Booth Assignment</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Booth Number & Name</label>
                  <p className="text-sm text-gray-900 font-medium">
                    {employeeDetails.booth_number || 'Not assigned'} - {employeeDetails.booth_name || 'Not assigned'}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Building Name</label>
                  <p className="text-sm text-gray-900 font-medium">{employeeDetails.building_name || 'Not assigned'}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Duty Hours</label>
                  <p className="text-sm text-gray-900 font-medium">{employeeDetails.booth_duration || 'Not assigned'}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ward Number</label>
                  <p className="text-sm text-gray-900 font-medium">{employeeDetails.ward_number || 'Not assigned'}</p>
                </div>
              </div>
            </div>

            {/* Location Tracking Card */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg mr-4">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Location Tracking</h3>
              </div>
              <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-purple-500 mr-3" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {getCurrentTime() ? 'Tracking Active' : 'Tracking Inactive'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {getCurrentTime() ? 'Duty hours: 9 AM - 5 PM' : 'Outside duty hours'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={startLocationTracking}
                  disabled={!getCurrentTime() || locationTracking}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    getCurrentTime() && !locationTracking
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {locationTracking ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    'Update Location'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* Image Upload Card */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg mr-4">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Image Upload with Location</h3>
              </div>
              
              <div className="text-center">
                {/* Image Preview or Upload Area */}
                <div className="mx-auto h-48 w-full max-w-sm bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 border-2 border-dashed border-blue-300 overflow-hidden">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Selected image" 
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="h-16 w-16 text-blue-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">No image selected</p>
                    </div>
                  )}
                </div>

                {/* File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  capture="environment" // This enables camera on mobile devices
                />

                {/* Action Buttons */}
                <div className="space-y-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full inline-flex items-center justify-center px-6 py-4 border border-gray-300 text-base font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <ImageIcon className="h-5 w-5 mr-3" />
                    {selectedImage ? 'Change Image' : 'Select Image from Gallery'}
                  </button>

                  {selectedImage && (
                    <button
                      onClick={handleImageUpload}
                      disabled={uploadLoading}
                      className="w-full inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {uploadLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Uploading Image...
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 mr-3" />
                          Upload Image with Location
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Upload Status */}
            {lastImageUpload && (
              <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Image uploaded successfully!</p>
                    <p className="text-sm text-green-600 mt-1">
                      Last upload: {lastImageUpload.toLocaleTimeString()} on {lastImageUpload.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Guidelines */}
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-6">
              <div className="flex items-start">
                <Camera className="h-6 w-6 text-blue-500 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-800 mb-3">Upload Instructions</h4>
                  <ul className="text-sm text-blue-700 space-y-2">
                    <li className="flex items-center">
                      <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-3"></div>
                      Select images from your gallery or take new photos
                    </li>
                    <li className="flex items-center">
                      <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-3"></div>
                      Location is automatically added when uploading
                    </li>
                    <li className="flex items-center">
                      <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-3"></div>
                      Upload during duty hours (9 AM - 5 PM)
                    </li>
                    <li className="flex items-center">
                      <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-3"></div>
                      Images are stored securely in the cloud
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MobileApp;