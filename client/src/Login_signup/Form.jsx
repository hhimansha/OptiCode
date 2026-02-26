import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, LogIn, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const Form = () => {
  const [isLogin, setIsLogin] = useState(true); // true = login, false = signup
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // handle form input changes
  const handleInputChanges = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  // handle form submission
  const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMessage('');
  setIsLoading(true);

  const url = isLogin
    ? 'http://localhost:5000/api/users/login'
    : 'http://localhost:5000/api/users/register';

  try {
    console.log('🟡 Making request to:', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData),
    });

    console.log('🟡 Response status:', response.status);
    const data = await response.json();
    console.log('🟡 Response data:', data);

    if (data.success) {
      setLoginSuccess(true);
      console.log(isLogin ? 'Logged in user:' : 'Registered user:', data.user);

      // Store userId for progress tracking
      if (data.user?._id) {
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("userName", data.user.name || "");
      }

      if (isLogin) {
        navigate('/face');
      }
    } else {
      setLoginSuccess(false);
      setErrorMessage(data.message || 'Something went wrong. Try again.');
    }
  } catch (error) {
    console.error('🔴 Network error:', error);
    setLoginSuccess(false);
    setErrorMessage('Network error: ' + error.message);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-8'>
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Left Side - Branding */}
        <div className="hidden md:flex bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full -ml-48 -mb-48"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <LogIn className="text-indigo-600" size={32} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              {isLogin ? 'Welcome Back!' : "Join Us!"}
            </h1>
            <p className="text-indigo-100 text-lg">
              {isLogin
                ? 'Sign in to continue your journey with us.'
                : 'Create your account and start exploring.'}
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-indigo-100">Secure & encrypted connection</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-indigo-100">24/7 customer support</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-indigo-100">Fast and reliable access</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Mobile Logo */}
            <div className="md:hidden flex justify-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <LogIn className="text-white" size={28} />
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {isLogin ? 'Sign In' : 'Sign Up'}
              </h2>
              <p className="text-gray-600">
                {isLogin
                  ? 'Enter your credentials to access your account'
                  : 'Create a new account to get started'}
              </p>
            </div>

            {/* Success & Error Messages */}
            {loginSuccess && (
              <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4 flex items-center gap-3 animate-fade-in">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-green-800 font-medium">
                  {isLogin ? 'Logged in successfully!' : 'Registered successfully!'}
                </span>
              </div>
            )}
            {errorMessage && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3 animate-fade-in">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="text-red-800 font-medium">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Name Field (only for signup) */}
              {!isLogin && (
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>Full Name</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <User size={20} />
                    </div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleInputChanges}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>Email Address</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    name='email'
                    placeholder='you@example.com'
                    value={formData.email}
                    onChange={handleInputChanges}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name='password'
                    placeholder='••••••••'
                    value={formData.password}
                    onChange={handleInputChanges}
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
                    required
                    autoComplete='current-password'
                  />
                  <button
                    type='button'
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
              </button>

            </form>

            {/* Toggle Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Form;