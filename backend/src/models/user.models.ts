import mongoose, { Schema, Document, Model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

interface IUser extends Document {
        email: string;
        fullName: string;
        avatar: string;
        password: string;
        refreshToken?: string;
        isPasswordCorrect(password: string): Promise<boolean>;
        generateAccessToken(): string;
        generateRefreshToken(): string;
}

const userSchema = new Schema<IUser>(
        {
                email: {
                        type: String,
                        required: true,
                        lowercase: true,
                        unique: true,
                },

                fullName: {
                        type: String,
                        required: true,
                },
                avatar: {
                        type: String,
                        required: true,
                },

                password: {
                        type: String,
                        required: true,
                },
                refreshToken: {
                        type: String,
                },
        },
        { timestamps: true }
);

// Hash password before saving
userSchema.pre<IUser>("save", async function (next) {
        if (!this.isModified("password")) return next();
        this.password = await bcrypt.hash(this.password, 10);
        next();
});

// Check password correctness
userSchema.methods.isPasswordCorrect = async function (password: string) {
        return await bcrypt.compare(password, this.password);
};

// JWT Access Token method
userSchema.methods.generateAccessToken = function (): string {
        return jwt.sign(
                { id: this._id, role: this.role },
                process.env.ACCESS_TOKEN_SECRET!,
                { expiresIn: '1d' }
        );
};
// JWT Refresh Token method
userSchema.methods.generateRefreshToken = function (): string {
        return jwt.sign(
                { id: this._id },
                process.env.REFRESH_TOKEN_SECRET!,
                { expiresIn: '7d' }
        );
};

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);


export { User }
