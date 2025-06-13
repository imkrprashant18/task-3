
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
interface PublicRouteProps {
        children: ReactNode;
}
const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
        const navigate = useNavigate();
        const token = sessionStorage.getItem("accessToken");
        if (token) {
                navigate("/dashboard");
                return null;
        } else {
                return <>{children}</>;
        }
};

export default PublicRoute;