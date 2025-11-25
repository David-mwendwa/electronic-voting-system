import User from '../models/User.js';
import Settings from '../models/Settings.js';
import { sendToken } from '../utils/jwt.js';
import { BadRequestError, UnauthenticatedError } from '../errors/index.js';

// Register user (POST /auth/register)
export const register = async (req, res, next) => {
  // Check if registration is enabled
  const settings = await Settings.getSettings();
  if (!settings.registrationEnabled) {
    throw new BadRequestError('User registration is currently disabled');
  }

  const { name, email, password, passwordConfirm } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new BadRequestError('Email already taken');
  }

  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    description: req.body.description || '',
  });
  sendToken(user, 200, res);
};

// Log in user (POST /auth/login)
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new BadRequestError('please provide email and password');

  const user = await User.findOne({ email }).select('+password');

  const isValidUser =
    user && (await user.comparePassword(password, user.password));
  if (!isValidUser)
    throw new UnauthenticatedError('incorrect email or password');

  user.password = undefined;
  sendToken(user, 200, res);
};
