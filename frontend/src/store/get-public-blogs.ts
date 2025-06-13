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
        selectedBlog: Blog | null;
        loading: boolean;
        error: string | null;
        fetchBlogs: () => Promise<void>;
        fetchBlogById: (id: string) => Promise<void>;
}

export const useBlogStore = create<BlogStore>()(
        immer((set) => ({
                blogs: null,
                selectedBlog: null,
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
                                        });
                                        return;
                                }

                                set((state) => {
                                        state.blogs = res.data.data;
                                        state.loading = false;
                                });
                        } catch (error) {
                                set((state) => {
                                        state.error =
                                                error instanceof Error ? error.message : 'Failed to fetch blogs';
                                        state.loading = false;
                                });
                        }
                },

                fetchBlogById: async (id: string) => {
                        set((state) => {
                                state.loading = true;
                                state.error = null;
                                state.selectedBlog = null;
                        });

                        try {
                                const res = await axios.get(`/api/v1/blog/get-my-blog/${id}`, {
                                        headers: {
                                                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                                        },
                                });

                                if (!res.data.success || res.data.statusCode !== 200) {
                                        set((state) => {
                                                state.error = res.data.message;
                                                state.loading = false;
                                        });
                                        return;
                                }

                                set((state) => {
                                        state.selectedBlog = res.data.data;
                                        state.loading = false;
                                });
                        } catch (error) {
                                set((state) => {
                                        state.error =
                                                error instanceof Error ? error.message : 'Failed to fetch blog by ID';
                                        state.loading = false;
                                });
                        }
                },
        }))
);
