import axios from "axios";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
interface User {
        _id: string;
        email: string;
        fullName: string;
        avatar: string;
        createdAt: string;
        updatedAt: string;
}

interface UserStoreState {
        user: User | null;
        loading: boolean;
        error: string | null;
        fetchCurrentUser: () => Promise<void>;
}

export const useUserStore = create<UserStoreState>()(
        immer((set) => ({
                user: null,
                loading: false,
                error: null,

                fetchCurrentUser: async () => {
                        set((state) => {
                                state.loading = true;
                                state.error = null;
                        });

                        try {
                                const token = localStorage.getItem("accessToken");
                                const res = await axios.get("/api/v1/users/current-user", {
                                        headers: {
                                                Authorization: `Bearer ${token}`
                                        }
                                });
                                set((state) => {
                                        state.user = res.data.data;
                                        state.loading = false;
                                });
                        } catch (error) {
                                set((state) => {
                                        state.error = error instanceof Error ? error.message : 'Failed to fetch users';
                                        state.loading = false;
                                });
                        }
                },
        }))
);
