import User from "../model/user.js";
import jwt from "jsonwebtoken";

const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            console.log('No token provided');
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(404).json({ error: "Unauthorized: User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error("Error in protectRoute:", error);
        res.status(401).json({ error: "Unauthorized: Token is invalid or expired" });
    }
};

export { protectRoute };
