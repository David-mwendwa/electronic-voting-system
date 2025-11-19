import User from '../models/User.js';
import { sendToken } from '../utils/jwt.js';
import { BadRequestError, UnauthenticatedError } from '../errors/index.js';

// Register user (POST /auth/register)
export const register = async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new BadRequestError('email already taken');
  }

  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
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
