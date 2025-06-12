
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import axios from 'axios';

interface RegisterPayload {
        fullName: string;
        username: string;
        email: string;
        password: string;
        avatar: File;
}

interface LoginPayload {
        email: string;
        password: string;
}

interface User {
        _id: string;
        fullName: string;
        username: string;
        email: string;
        avatarUrl?: string;
}

interface AuthState {
        loading: boolean;
        error: string | null;
        user: User | null;
        register: (payload: RegisterPayload) => Promise<User>;
        login: (payload: LoginPayload) => Promise<User>;
}

export const useAuthStore = create<AuthState>()(
        immer((set) => ({
                loading: false,
                error: null,
                user: null,
                token: null,
                register: async (payload) => {
                        try {
                                set((state) => {
                                        state.loading = true;
                                        state.error = null;
                                });

                                const formData = new FormData();
                                formData.append('fullName', payload.fullName);
                                formData.append('username', payload.username);
                                formData.append('email', payload.email);
                                formData.append('password', payload.password);
                                formData.append('avatar', payload.avatar);

                                const res = await axios.post('/api/v1/users/register', formData);

                                set((state) => {
                                        state.user = res.data?.data || null;
                                });

                                return res.data?.data as User;
                        } catch (err) {
                                set((state) => {
                                        if (axios.isAxiosError(err)) {
                                                state.error = err.response?.data?.message || 'Registration failed';
                                        } else {
                                                state.error = 'Registration failed';
                                        }
                                });
                                throw err;
                        } finally {
                                set((state) => {
                                        state.loading = false;
                                });
                        }
                },
                login: async (payload) => {
                        try {
                                set((state) => {
                                        state.loading = true;
                                        state.error = null;
                                });

                                const res = await axios.post('/api/v1/users/login', payload);
                                const { accessToken, refreshToken } = res.data.data;
                                localStorage.setItem("accessToken", accessToken);
                                localStorage.setItem("refreshToken", refreshToken);
                                set((state) => {
                                        state.user = res.data?.data || null;
                                });
                                return res.data?.data as User;
                        } catch (err) {
                                set((state) => {
                                        if (axios.isAxiosError(err)) {
                                                state.error = err.response?.data?.message || 'Login failed';
                                        } else {
                                                state.error = 'Login failed';
                                        }
                                });
                                throw err;
                        } finally {
                                set((state) => {
                                        state.loading = false;
                                });
                        }
                },

        }))
);
