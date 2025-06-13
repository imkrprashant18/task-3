import { RouterProvider, createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/home-page";
import Dashboard from "./components/dashboard";
import PublicRoute from "./components/publicroute";
import ProtectedRoute from "./components/protectedRoute";
import Blogs from "./components/blogs";
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PublicRoute>
        <HomePage />
      </PublicRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/blogs/:slug",
    element: (
      <ProtectedRoute>
        <Blogs />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
