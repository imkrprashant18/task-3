
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import axios from 'axios';

export interface Blog {
        _id: string;
        title: string;
        featureImage: string;
        slug: string;
        content: string;
        isAuthor: boolean;
        author: {
                _id: string;
                email: string;
                fullName: string;
        };
        createdAt: string;
        updatedAt: string;
        __v: number;
}

interface BlogStore {
        blogs: Blog[] | null;
        loading: boolean;
        error: string | null;
        fetchBlogs: () => Promise<void>;
}

export const useBlogStore = create<BlogStore>()(
        immer((set) => ({
                blogs: null,
                loading: false,
                error: null,
                fetchBlogs: async () => {
                        set((state) => {
                                state.loading = true;
                                state.error = null;
                        });
                        try {
                                const res = await axios.get('/api/v1/blog/get-my-blogs', {
                                        headers: {
                                                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                                        },
                                });
                                if (!res.data.success || res.data.statusCode !== 200) {
                                        set((state) => {
                                                state.error = res.data.message;
                                                state.loading = false;
                                        })
                                }
                                const blogData = res.data.data;
                                set((state) => {
                                        state.blogs = blogData;
                                        state.loading = false;
                                });
                        } catch (error) {
                                set((state) => {
                                        state.error = error instanceof Error ? error.message : 'Failed to fetch blogs';
                                        state.loading = false;
                                });
                        }
                },
        }))
);
