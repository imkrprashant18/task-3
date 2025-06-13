import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useBlogStore } from "../store/get-public-blogs";
import axios from "axios";

const Blogs = () => {
        const location = useLocation();
        const blogId = location.state;
        const navigate = useNavigate();

        const { fetchBlogById, selectedBlog, loading, error } = useBlogStore();

        // Modal and form state
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [title, setTitle] = useState("");
        const [content, setContent] = useState("");
        const [imageFile, setImageFile] = useState<File | null>(null);
        const [imagePreview, setImagePreview] = useState<string | null>(null);
        const [formError, setFormError] = useState<string | null>(null);
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [isDeleting, setIsDeleting] = useState(false);

        useEffect(() => {
                if (blogId) {
                        fetchBlogById(blogId);
                }
        }, [blogId, fetchBlogById]);

        // When selectedBlog changes, update form fields and image preview
        useEffect(() => {
                if (selectedBlog) {
                        setTitle(selectedBlog.title);
                        setContent(selectedBlog.content);
                        setImagePreview(selectedBlog.featureImage);
                        setImageFile(null); // reset file input
                        setFormError(null);
                }
        }, [selectedBlog]);

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
                if (!content.trim()) {
                        setFormError("Content is required.");
                        return;
                }

                setIsSubmitting(true);

                try {
                        const formData = new FormData();
                        formData.append("title", title);
                        formData.append("content", content);

                        if (imageFile) {
                                formData.append("featureImage", imageFile);
                        }

                        await axios.patch(
                                `/api/v1/blog/update-blog/${blogId}`,
                                formData,
                                {
                                        headers: {
                                                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                                                "Content-Type": "multipart/form-data",
                                        },
                                }
                        );

                        alert("Blog updated successfully!");
                        setIsModalOpen(false);
                        fetchBlogById(blogId); // Refresh the blog data
                } catch (error) {
                        console.error(error);
                        setFormError("Failed to update the blog.");
                } finally {
                        setIsSubmitting(false);
                }
        };

        const handleDelete = async () => {
                if (!window.confirm("Are you sure you want to delete this blog? This action cannot be undone.")) {
                        return;
                }

                setIsDeleting(true);

                try {
                        await axios.delete(
                                `/api/v1/blog/delete-blog/${blogId}`,
                                {
                                        headers: {
                                                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                                        },
                                }
                        );

                        alert("Blog deleted successfully!");
                        navigate("/dashboard"); // Redirect to blog list page after delete
                } catch (error) {
                        console.error(error);
                        alert("Failed to delete the blog.");
                } finally {
                        setIsDeleting(false);
                }
        };

        if (loading) return <div className="p-6">Loading...</div>;
        if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
        if (!selectedBlog) return <div className="p-6">No blog found.</div>;

        return (
                <div className="p-6 max-w-4xl mx-auto">
                        <img
                                src={selectedBlog.featureImage}
                                alt={selectedBlog.title}
                                className="w-full h-64 object-cover rounded-xl mb-4"
                        />

                        <h1 className="text-3xl font-bold mb-2">{selectedBlog.title}</h1>
                        <p className="text-sm text-gray-500 mb-6">
                                By {selectedBlog.author.fullName} •{" "}
                                {new Date(selectedBlog.createdAt).toLocaleDateString()}
                        </p>

                        <p className="text-gray-800 text-lg mb-6 whitespace-pre-line">
                                {selectedBlog.content}
                        </p>

                        {selectedBlog.isAuthor && (
                                <div className="flex gap-4">
                                        <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                                                disabled={isDeleting}
                                        >
                                                Update
                                        </button>
                                        <button
                                                onClick={handleDelete}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                                disabled={isDeleting}
                                        >
                                                {isDeleting ? "Deleting..." : "Delete"}
                                        </button>
                                </div>
                        )}

                        {/* Update Modal */}
                        {isModalOpen && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                                        <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl relative">
                                                <h2 className="text-xl font-bold mb-4">Update Blog</h2>

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
                                                                <label className="block text-sm font-medium mb-1">Content</label>
                                                                <textarea
                                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        rows={4}
                                                                        value={content}
                                                                        onChange={(e) => setContent(e.target.value)}
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

                                                        {formError && (
                                                                <div className="text-red-600 text-sm">{formError}</div>
                                                        )}

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

export default Blogs;
