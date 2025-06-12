# 📝 Backend – Task 3
A RESTful backend API for a blogging platform, built with **TypeScript**, **Express**, **MongoDB (Mongoose)**, and **Bun** runtime.  
Supports user authentication, blog CRUD, file uploads (Cloudinary), and JWT-based session management.

---

## 📚 Table of Contents

- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [⚙️ Setup & Installation](#️-setup--installation)
- [🔐 Environment Variables](#-environment-variables)
- [📜 Scripts](#-scripts)
- [🔗 API Endpoints](#-api-endpoints)
  - [👤 User Routes](#-user-routes)
  - [📝 Blog Routes](#-blog-routes)
- [📤 File Uploads](#-file-uploads)
- [🧑‍💻 Development Notes](#-development-notes)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

- 🔐 User registration & login with JWT
- 🔒 Secure password hashing with bcrypt
- 👤 User profile update & avatar upload (Cloudinary)
- 📝 Blog CRUD (Create, Read, Update, Delete)
- 🖼 Blog image upload
- 🔐 Protected routes using JWT middleware
- 🧠 Strong TypeScript typings
- 🧩 Modular and maintainable code structure

---

## 🛠 Tech Stack

- ⚡ [Bun](https://bun.sh/) – Runtime & package manager
- 🚀 [Express](https://expressjs.com/) – API server
- 🔷 [TypeScript](https://www.typescriptlang.org/) – Static typing
- 🟢 [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) – Database & ORM
- ☁️ [Cloudinary](https://cloudinary.com/) – Image hosting
- 🔐 [JWT](https://jwt.io/) – Authentication
- 📂 [Multer](https://github.com/expressjs/multer) – File upload middleware
- 🔑 [bcrypt](https://github.com/kelektiv/node.bcrypt.js) – Password hashing

---

## 📁 Project Structure
backend/
├── src/
│ ├── app.ts # Express app setup
│ ├── index.ts # Entry point
│ ├── controllers/ # Route controllers
│ ├── db/ # DB connection
│ ├── middelware/ # Middlewares (auth, multer)
│ ├── models/ # Mongoose models
│ ├── routes/ # API route definitions
│ └── utils/ # Utility functions
├── public/
│ └── temp/ # Temporary file uploads
├── .env # Environment variables
├── package.json
├── tsconfig.json
└── README.md


## ⚙️ Setup & Installation
1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd backend
Install dependencies:
bash
Copy
Edit
bun install
Configure environment variables:
Copy .env.sample to .env and fill in the values.
Start MongoDB (locally or via cloud):
Update MONGODB_URI in .env accordingly.
Run the development server:
bash
Copy
Edit
bun run src/index.ts
# or with hot-reload:
bun run dev


🔐 Environment Variables
Refer to .env.sample for the full list:

PORT

MONGODB_URI

CORS_ORIGIN

ACCESS_TOKEN_SECRET

REFRESH_TOKEN_SECRET

CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

🔗 API Endpoints
👤 User Routes
Method	Endpoint	Description	Auth Required
POST	/api/v1/users/register	Register new user (avatar required)	❌ No
POST	/api/v1/users/login	User login	❌ No
GET	/api/v1/users/current-user	Get current user info	✅ Yes
POST	/api/v1/users/logout	User logout	✅ Yes
PATCH	/api/v1/users/update	Update profile (avatar optional)	✅ Yes

📝 Blog Routes
Method	Endpoint	Description	Auth Required
POST	/api/v1/blog/create-blog	Create blog (image required)	✅ Yes
GET	/api/v1/blog/get-all-blogs	List all blogs	❌ No
GET	/api/v1/blog/get-blog/:id	Get blog by ID	❌ No
GET	/api/v1/blog/get-my-blogs	Get current user's blogs	✅ Yes
GET	/api/v1/blog/get-my-blog/:id	Get specific blog by current user	✅ Yes
PATCH	/api/v1/blog/update-blog/:id	Update blog (image optional)	✅ Yes
DELETE	/api/v1/blog/delete-blog/:id	Delete blog	✅ Yes

📤 File Uploads
Images are uploaded to Cloudinary.

Temporary storage is in public/temp/.

Use multipart/form-data:

Avatar → field name: avatar

Blog image → field name: featureImage

🧑‍💻 Development Notes
TypeScript strict mode is enabled.

JWTs are stored as HTTP-only cookies.

Passwords are hashed using bcrypt.

Cloudinary is used for image hosting – setup via .env.

Standardized error handling via ApiError and asyncHandler.

File uploads are managed using multer.

