import mongoose from "mongoose";
import User from "../model/user.js";
import bcrypt from "bcrypt"
import generateCookie from "../util/helper/generateCookie.js";
import {v2 as cloudinary} from "cloudinary"

const signController = async (req, res) => {
  try {
    const { username, name, lname, email, password, pimage, country, city, phone, address, pincode } = req.body;

    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(404).json({ error: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);
    const newUser = new User({
      username,
      fname: name,
      lname,
      pimage: pimage || "",
      country,
      city,
      phone,
      address,
      pincode,
      email,
      password: hashedPass,
    });

    await newUser.save();

    if (newUser) {
      generateCookie(newUser._id, res);
      return res.status(201).json(
        newUser
      );
    } else {
      return res.status(400).json({ error: "Invalid user data" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const SigninController = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ err: "All fields are required" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ err: "Invalid credentials" });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ err: "Invalid credentials" });
        }
        generateCookie(user._id, res);
        return res.status(200).json(
            user
        );

    } catch (err) {
        console.error(err);
        if (!res.headersSent) {
            return res.status(500).json({ err: "Internal server error" });
        }
    }
};

const logoutController = async(req,res) => {
    try {
        res.cookie("jwt","",{maxAge:1});
		res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.log("Error in signupUser: ", error.message);
        res.status(500).json({ error });

    }
}

const updateController = async (req, res) => {
    try {
      const { username, fname, lname, email, country, city, phone, address, pincode } = req.body;
      let { password, pimage } = req.body;
      console.log(pimage,"pimage")
      const userId = req.user._id;
  
      if (req.params.id !== userId.toString()) {
        return res.status(401).json({ error: 'Unauthorized user' });
      }
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      if (password) {
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);
      }
  
      if (pimage) {
        const result = await cloudinary.uploader.upload(pimage);
        pimage = result.secure_url;
      } else {
        pimage = user.pimage;
      }
  
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          fname: fname || user.fname,
          lname: lname || user.lname,
          username: username || user.username,
          email: email || user.email,
          password: password || user.password,
          country: country || user.country,
          city: city || user.city,
          phone: phone || user.phone,
          address: address || user.address,
          pincode: pincode || user.pincode,
          pimage: pimage || user.pimage,
        },
        { new: true }
      );
      console.log(updatedUser);
  
      if (updatedUser) {
        updatedUser.password = null;
        return res.status(200).json(updatedUser);
      } else {
        return res.status(400).json({ error: 'Failed to update user' });
      }
    } catch (err) {
      console.error('Error in update:', err);
      if (!res.headersSent) {
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
  



const getuserProfile = async (req, res) => {
    const { query } = req.params;
  
    try {
      let user;
      if(mongoose.Types.ObjectId.isValid(query)){
        user = await User.findById(query).select("-password -updatedAt");
      }
      else{
        user = await User.findOne({ username: query }).select("-password -updatedAt");
      }
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
export {SigninController,signController,logoutController,updateController,getuserProfile}