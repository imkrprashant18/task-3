import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/get-current-profile";

interface ProtectedRouteProps {
        children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
        const { user, fetchCurrentUser } = useUserStore();
        const navigate = useNavigate();

        useEffect(() => {
                if (!user) {
                        fetchCurrentUser();
                }
        }, [fetchCurrentUser, user]);

        if (localStorage.getItem("accessToken")) {
                return <>{children}</>;
        } else {
                navigate("/");
                return null;
        }
};

export default ProtectedRoute;
