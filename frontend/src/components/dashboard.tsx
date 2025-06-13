import { useEffect, useState } from "react";
import { useBlogStore } from "../store/get-public-blogs";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
        const { blogs, fetchBlogs } = useBlogStore();
        const navigate = useNavigate();

        // Modal and form state
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [title, setTitle] = useState("");
        const [description, setDescription] = useState("");
        const [imageFile, setImageFile] = useState<File | null>(null);
        const [imagePreview, setImagePreview] = useState<string | null>(null);
        const [formError, setFormError] = useState<string | null>(null);
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [isLoggingOut, setIsLoggingOut] = useState(false);

        useEffect(() => {
                fetchBlogs();
        }, [fetchBlogs]);

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                }
        };

        const handleSubmit = async (e: React.FormEvent) => {
                e.preventDefault();
                setFormError(null);

                if (!title.trim()) {
                        setFormError("Title is required.");
                        return;
                }
                if (!description.trim()) {
                        setFormError("Description is required.");
                        return;
                }

                setIsSubmitting(true);

                try {
                        const formData = new FormData();
                        formData.append("title", title);
                        formData.append("content", description);

                        if (imageFile) {
                                formData.append("featureImage", imageFile);
                        }

                        await axios.post("/api/v1/blog/create-blog", formData, {
                                headers: {
                                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                                        "Content-Type": "multipart/form-data",
                                },
                        });

                        alert("Blog created successfully!");
                        setIsModalOpen(false);
                        setTitle("");
                        setDescription("");
                        setImageFile(null);
                        setImagePreview(null);
                        fetchBlogs(); // Refresh blog list
                } catch (error) {
                        console.error(error);
                        setFormError("Failed to create the blog.");
                } finally {
                        setIsSubmitting(false);
                }
        };

        const handleLogout = async () => {
                setIsLoggingOut(true);
                try {
                        await axios.post(
                                "/api/v1/users/logout",
                                {},
                                {
                                        headers: {
                                                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                                        },
                                }
                        );

                        // Clear tokens from localStorage or wherever you store them
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("refreshToken");

                        // Redirect to login or home page after logout
                        navigate("/", { replace: true });
                } catch (error) {
                        console.error("Logout failed:", error);
                        alert("Logout failed. Please try again.");
                } finally {
                        setIsLoggingOut(false);
                }
        };

        return (
                <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-bold">Blogs</h1>

                                <div className="flex gap-4">
                                        <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                                disabled={isLoggingOut}
                                        >
                                                + Add Blog
                                        </button>

                                        <button
                                                onClick={handleLogout}
                                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                                                disabled={isLoggingOut}
                                        >
                                                {isLoggingOut ? "Logging out..." : "Logout"}
                                        </button>
                                </div>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {blogs?.map((blog) => (
                                        <Link to={`/blogs/${blog.slug}`} state={blog._id} key={blog._id}>
                                                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition">
                                                        <img
                                                                src={blog.featureImage}
                                                                alt={blog.title}
                                                                className="w-full h-48 object-cover"
                                                        />
                                                        <div className="p-4">
                                                                <h2 className="text-lg font-semibold mb-1">{blog.title}</h2>
                                                                <p className="text-sm text-gray-500 mb-2">
                                                                        Published by {blog.author?.fullName || "Unknown Author"}
                                                                </p>
                                                                <p className="text-gray-700 line-clamp-3">{blog.content}</p>
                                                        </div>
                                                </div>
                                        </Link>
                                ))}
                        </div>

                        {/* Add Blog Modal */}
                        {isModalOpen && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                                        <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl relative">
                                                <h2 className="text-xl font-bold mb-4">Add Blog</h2>

                                                <form onSubmit={handleSubmit} className="space-y-4">
                                                        <div>
                                                                <label className="block text-sm font-medium mb-1">Title</label>
                                                                <input
                                                                        type="text"
                                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        value={title}
                                                                        onChange={(e) => setTitle(e.target.value)}
                                                                        disabled={isSubmitting}
                                                                />
                                                        </div>
                                                        <div>
                                                                <label className="block text-sm font-medium mb-1">Description</label>
                                                                <textarea
                                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        rows={4}
                                                                        value={description}
                                                                        onChange={(e) => setDescription(e.target.value)}
                                                                        disabled={isSubmitting}
                                                                />
                                                        </div>
                                                        <div>
                                                                <label className="block text-sm font-medium mb-1">Feature Image</label>
                                                                <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={handleFileChange}
                                                                        disabled={isSubmitting}
                                                                />
                                                                {imagePreview && (
                                                                        <img
                                                                                src={imagePreview}
                                                                                alt="Preview"
                                                                                className="mt-2 w-32 h-32 object-cover rounded-md"
                                                                        />
                                                                )}
                                                        </div>

                                                        {formError && <div className="text-red-600 text-sm">{formError}</div>}

                                                        <div className="flex justify-end gap-2 mt-4">
                                                                <button
                                                                        type="button"
                                                                        className="px-4 py-2 rounded-lg border"
                                                                        onClick={() => setIsModalOpen(false)}
                                                                        disabled={isSubmitting}
                                                                >
                                                                        Cancel
                                                                </button>
                                                                <button
                                                                        type="submit"
                                                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                                                        disabled={isSubmitting}
                                                                >
                                                                        {isSubmitting ? "Saving..." : "Save"}
                                                                </button>
                                                        </div>
                                                </form>

                                                <button
                                                        onClick={() => setIsModalOpen(false)}
                                                        className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
                                                        disabled={isSubmitting}
                                                >
                                                        ✕
                                                </button>
                                        </div>
                                </div>
                        )}
                </div>
        );
};

export default Dashboard;
