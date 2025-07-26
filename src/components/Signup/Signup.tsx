"use client"
import { useEffect, useState, useCallback } from 'react';
import { Eye, EyeOff, User, Mail, Lock, Hash, UserCheck, Users, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const Signup = ({ role }: { role: string }) => {
    console.log('inside Signup component');
    
    
    // Form state
    const [URN, setURN] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [gender, setGender] = useState("");
    const [selectedMentorId, setSelectedMentorId] = useState("");
    
    // UI state
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mentors, setMentors] = useState([]);
    const [mentorsLoading, setMentorsLoading] = useState(true);
    
    // Validation state
    const [availability, setAvailability] = useState({
        username: { available: null, checking: false },
        URN: { available: null, checking: false }
    });
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");

    // Debounced availability check
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    };

    const checkAvailability = async (username, URN) => {
        if (!username && !URN) return;
        
        setAvailability(prev => ({
            username: { ...prev.username, checking: !!username },
            URN: { ...prev.URN, checking: !!URN }
        }));

        try {
            const params = new URLSearchParams();
            if (username) params.append('username', username);
            if (URN) params.append('URN', URN);
            
            const response = await fetch(`/api/exists/check?${params.toString()}`);
            const data = await response.json();
            
            setAvailability(prev => ({
                username: {
                    available: username ? data.data?.usernameAvailable : prev.username.available,
                    checking: false
                },
                URN: {
                    available: URN ? data.data?.URNAvailable : prev.URN.available,
                    checking: false
                }
            }));
        } catch (error) {
            setAvailability(prev => ({
                username: { available: null, checking: false },
                URN: { available: null, checking: false }
            }));
        }
    };

    const debouncedCheck = useCallback(debounce(checkAvailability, 800), []);

    useEffect(() => {
        if (username.length >= 3 || URN.length >= 3) {
            debouncedCheck(username.length >= 3 ? username : null, URN.length >= 3 ? URN : null);
        }
    }, [username, URN, debouncedCheck]);

    const getAllMentors = async () => {
        try {
            setMentorsLoading(true);
            const response = await fetch('/api/mentor');
            const data = await response.json();
            setMentors(data.data || []);
        } catch (error) {
            console.error('Error fetching mentors:', error);
        } finally {
            setMentorsLoading(false);
        }
    };

    useEffect(() => {
        if (role === "Student") {
            getAllMentors();
        } else {
            setMentorsLoading(false);
        }
    }, [role]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!URN.trim()) newErrors.URN = "URN is required";
        if (!username.trim()) newErrors.username = "Username is required";
        if (!email.trim()) newErrors.email = "Email is required";
        if (!password.trim()) newErrors.password = "Password is required";
        if (!confirmPassword.trim()) newErrors.confirmPassword = "Please confirm password";
        if (!gender) newErrors.gender = "Please select gender";
        
        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords don't match";
        }
        
        if (availability.username.available === false) {
            newErrors.username = "Username is already taken";
        }
        
        if (availability.URN.available === false) {
            newErrors.URN = "URN is already taken";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setSubmitError("");
        
        if (!validateForm()) return;
        
        setIsLoading(true);
        
        try {
            const signupData = {
                URN: URN.trim(),
                username: username.trim(),
                email: email.trim(),
                password,
                gender,
                role
            };
            
            if (role === "Student" && selectedMentorId) {
                signupData.mentorId = selectedMentorId;
            }
            console.log('sending signup req');
            
            const response = await fetch("/api/user", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signupData)
            });
            console.log('done sending signup req');
            
            const data = await response.json();
            
            if (data.success) {
                // Redirect to home page
                window.location.href = '/';
            } else {
                setSubmitError(data.message || "Something went wrong. Please try again.");
            }
        } catch (error) {
            setSubmitError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const getInputStatus = (field) => {
        if (field === 'username') {
            if (availability.username.checking) return 'checking';
            if (availability.username.available === true) return 'success';
            if (availability.username.available === false) return 'error';
        }
        if (field === 'URN') {
            if (availability.URN.checking) return 'checking';
            if (availability.URN.available === true) return 'success';
            if (availability.URN.available === false) return 'error';
        }
        if (errors[field]) return 'error';
        return 'default';
    };

    const getStatusIcon = (field) => {
        const status = getInputStatus(field);
        switch (status) {
            case 'checking':
                return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'error':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                    <div className="text-center mb-8">
                        <div className="mx-auto h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                            <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Create {role} Account
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        </p>
                    </div>

                    <div onSubmit={handleSignup} className="space-y-6">
                        {/* URN Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                University Roll Number (URN)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Hash className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={URN}
                                    onChange={(e) => setURN(e.target.value)}
                                    className={`pl-10 pr-10 block w-full rounded-md border ${
                                        getInputStatus('URN') === 'error' 
                                            ? 'border-red-300 dark:border-red-600' 
                                            : getInputStatus('URN') === 'success'
                                            ? 'border-green-300 dark:border-green-600'
                                            : 'border-gray-300 dark:border-gray-600'
                                    } bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                                    placeholder="Enter your URN"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    {getStatusIcon('URN')}
                                </div>
                            </div>
                            {errors.URN && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.URN}</p>
                            )}
                        </div>

                        {/* Username Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className={`pl-10 pr-10 block w-full rounded-md border ${
                                        getInputStatus('username') === 'error' 
                                            ? 'border-red-300 dark:border-red-600' 
                                            : getInputStatus('username') === 'success'
                                            ? 'border-green-300 dark:border-green-600'
                                            : 'border-gray-300 dark:border-gray-600'
                                    } bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                                    placeholder="Enter your username"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    {getStatusIcon('username')}
                                </div>
                            </div>
                            {errors.username && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`pl-10 block w-full rounded-md border ${
                                        errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                                    } bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                                    placeholder="Enter your email"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`pl-10 pr-10 block w-full rounded-md border ${
                                        errors.password ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                                    } bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                                    placeholder="Enter password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`pl-10 pr-10 block w-full rounded-md border ${
                                        errors.confirmPassword ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                                    } bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                                    placeholder="Confirm password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Gender Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Gender
                            </label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className={`block w-full rounded-md border ${
                                    errors.gender ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                                } bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                            {errors.gender && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.gender}</p>
                            )}
                        </div>

                        {/* Mentor Selection (Only for Students) */}
                        {role === "Student" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Select Mentor (Optional)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Users className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <select
                                        value={selectedMentorId}
                                        onChange={(e) => setSelectedMentorId(e.target.value)}
                                        disabled={mentorsLoading}
                                        className="pl-10 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        <option value="">Choose a mentor (optional)</option>
                                        {mentorsLoading ? (
                                            <option disabled>Loading mentors...</option>
                                        ) : (
                                            mentors.map((mentor) => (
                                                <option key={mentor.id} value={mentor.id}>
                                                    {mentor.username}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Submit Error */}
                        {submitError && (
                            <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-3">
                                <div className="flex">
                                    <AlertCircle className="h-5 w-5 text-red-400" />
                                    <div className="ml-3">
                                        <p className="text-sm text-red-800 dark:text-red-200">{submitError}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            onClick={handleSignup}
                            disabled={isLoading || availability.username.checking || availability.URN.checking}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Creating Account...
                                </>
                            ) : (
                                `Create ${role} Account`
                            )}
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                Sign in
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;