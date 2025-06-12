import mongoose, { Document, Schema } from "mongoose";

export interface IBlog extends Document {
        title: string;
        featureImage: string;
        slug: string;
        content: string;
        isAuthor: boolean;
        author: mongoose.Types.ObjectId;
        comments: mongoose.Types.ObjectId[];
        likes: mongoose.Types.ObjectId[];
        createdAt: Date;
        updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
        {
                title: {
                        type: String,
                        required: true,
                        trim: true,
                },
                featureImage: {
                        type: String,
                        required: true,
                },
                slug: {
                        type: String,
                        required: true,
                        unique: true,
                        lowercase: true,
                        trim: true,
                },
                content: {
                        type: String,
                        required: true,
                },
                isAuthor: {
                        type: Boolean,
                        default: false,
                },
                author: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        required: true,
                },
        },
        {
                timestamps: true, // adds createdAt and updatedAt fields
        }
);

const Blogs = mongoose.model<IBlog>("Blog", blogSchema);


export { Blogs }