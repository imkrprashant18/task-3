import React, { useState } from 'react';
import { useAuthStore } from '../store/user-auth';
import { useNavigate } from 'react-router-dom';

const AuthTabs = () => {
        const navigate = useNavigate()
        const [tab, setTab] = useState<'login' | 'register'>('login');
        // Login state
        const [loginEmail, setLoginEmail] = useState('');
        const [loginPassword, setLoginPassword] = useState('');
        const [loginError, setLoginError] = useState('');

        // Register state
        const [registerData, setRegisterData] = useState({
                fullName: '',
                username: '',
                email: '',
                password: '',
        });
        const [avatarFile, setAvatarFile] = useState<File | null>(null);
        const [registerError, setRegisterError] = useState('');
        const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
        const { login, register, loading, error } = useAuthStore()
        const handleLogin = async (e: React.FormEvent) => {
                e.preventDefault();
                if (!loginEmail || !loginPassword) {
                        setLoginError('Please fill all fields.');
                        return;
                }
                setLoginError('');
                await login({ email: loginEmail, password: loginPassword }).then(
                        res => {
                                console.log(res)
                                navigate('/dashboard')
                        }).catch(err => {
                                console.log(err)
                        })
        };

        const handleRegister = async (e: React.FormEvent) => {
                e.preventDefault();
                const { fullName, username, email, password } = registerData;

                if (!fullName || !username || !email || !password || !avatarFile) {
                        setRegisterError('All fields including avatar are required.');
                        return;
                }

                setRegisterError('');

                const formData = new FormData();
                formData.append('fullName', fullName);
                formData.append('username', username);
                formData.append('email', email);
                formData.append('password', password);
                formData.append('avatar', avatarFile);
                await register({ fullName, username, avatar: avatarFile, password, email }).then(
                        res => {
                                console.log(res)
                                setTab('login')
                        }).catch(err => {
                                console.log(err)
                        })
                // Submit formData to API here
        };

        const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                        setAvatarFile(file);
                        setAvatarPreview(URL.createObjectURL(file));
                }
        };

        return (
                <div className="max-w-md mx-auto mt-12 p-6 bg-white shadow-md rounded-md">
                        <h1 className='text-red-500'>{error}</h1>
                        <div className="flex justify-center mb-6">
                                <button
                                        className={`px-4 py-2 font-semibold ${tab === 'login' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'
                                                }`}
                                        onClick={() => setTab('login')}
                                >
                                        Login
                                </button>
                                <button
                                        className={`ml-6 px-4 py-2 font-semibold ${tab === 'register' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'
                                                }`}
                                        onClick={() => setTab('register')}
                                >
                                        Register
                                </button>
                        </div>

                        {tab === 'login' ? (
                                <form onSubmit={handleLogin} className="space-y-4">
                                        <div>
                                                <label className="block text-sm font-medium">Email</label>
                                                <input
                                                        type="email"
                                                        value={loginEmail}
                                                        onChange={(e) => setLoginEmail(e.target.value)}
                                                        className="w-full mt-1 p-2 border rounded-md"
                                                />
                                        </div>
                                        <div>
                                                <label className="block text-sm font-medium">Password</label>
                                                <input
                                                        type="password"
                                                        value={loginPassword}
                                                        onChange={(e) => setLoginPassword(e.target.value)}
                                                        className="w-full mt-1 p-2 border rounded-md"
                                                />
                                        </div>
                                        {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
                                        <button
                                                type="submit"
                                                className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
                                        >
                                                {loading ? "Loading..." : "Login"}
                                        </button>
                                </form>
                        ) : (
                                <form onSubmit={handleRegister} className="space-y-4" encType="multipart/form-data">
                                        <div>
                                                <label className="block text-sm font-medium">Full Name</label>
                                                <input
                                                        type="text"
                                                        value={registerData.fullName}
                                                        onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                                                        className="w-full mt-1 p-2 border rounded-md"
                                                />
                                        </div>
                                        <div>
                                                <label className="block text-sm font-medium">Username</label>
                                                <input
                                                        type="text"
                                                        value={registerData.username}
                                                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                                                        className="w-full mt-1 p-2 border rounded-md"
                                                />
                                        </div>
                                        <div>
                                                <label className="block text-sm font-medium">Email</label>
                                                <input
                                                        type="email"
                                                        value={registerData.email}
                                                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                                        className="w-full mt-1 p-2 border rounded-md"
                                                />
                                        </div>
                                        <div>
                                                <label className="block text-sm font-medium">Avatar</label>
                                                <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleAvatarChange}
                                                        className="w-full mt-1 p-2 border rounded-md"
                                                />
                                                {avatarPreview && (
                                                        <img src={avatarPreview} alt="Preview" className="mt-2 h-16 w-16 rounded-full object-cover" />
                                                )}
                                        </div>
                                        <div>
                                                <label className="block text-sm font-medium">Password</label>
                                                <input
                                                        type="password"
                                                        value={registerData.password}
                                                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                                        className="w-full mt-1 p-2 border rounded-md"
                                                />
                                        </div>
                                        {registerError && <p className="text-red-500 text-sm">{registerError}</p>}
                                        <button
                                                type="submit"
                                                className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
                                        >
                                                {loading ? "Loading..." : "Register"}
                                        </button>
                                </form>
                        )}
                </div>
        );
};

export default AuthTabs;
