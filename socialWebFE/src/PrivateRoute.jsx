import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

function PrivateRoute({ children }) {
    const location = useLocation();
    const { token } = useAuth();
    if (!token) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return { children };
}

PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default PrivateRoute;
