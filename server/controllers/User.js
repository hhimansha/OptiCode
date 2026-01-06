import validator from "validator";

import User from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  console.log('🔵 REGISTER ATTEMPT:', { name, email, password: password ? '***' : 'missing' });

  if (!name || !email || !password) {
    console.log('🔴 Missing fields');
    return res.status(400).json({
      success: false,
      message: "Please enter all fields"
    });
  }

  try {
    console.log('🟡 Checking email validity...');
    if (!validator.isEmail(email)) {
      console.log('🔴 Invalid email format');
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email"
      });
    }

    console.log('🟡 Checking password length...');
    if (password.length < 8) {
      console.log('🔴 Password too short');
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long"
      });
    }

    console.log('🟡 Checking if user exists...');
    const existingUser = await User.findOne({ email });
    console.log('🟡 Existing user result:', existingUser);

    if (existingUser) {
      console.log('🔴 User already exists');
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    console.log('🟡 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('🟡 Creating user...');
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    console.log('🟡 Saving user to database...');
    await newUser.save();
    console.log('🟢 User registered successfully:', newUser.email);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { id: newUser._id, name: newUser.name, email: newUser.email }
    });

  } catch (error) {
    console.error('🔴 REGISTER ERROR:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  console.log('🔵 LOGIN ATTEMPT:', { email, password: password ? '***' : 'missing' });

  if (!email || !password) {
    console.log('🔴 Missing fields');
    return res.status(400).json({
      success: false,
      message: "Please enter all fields"
    });
  }

  try {
    console.log('🟡 Finding user...');
    const user = await User.findOne({ email });
    console.log('🟡 User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('🔴 User not found');
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    console.log('🟡 Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🟡 Password match:', isMatch);

    if (!isMatch) {
      console.log('🔴 Password mismatch');
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    console.log('🟡 Generating token...');
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('🟡 Setting cookie...');
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    console.log('🟢 Login successful');
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error('🔴 LOGIN ERROR:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message
    });
  }
};
