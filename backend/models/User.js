import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      trim: true,
      default: function () {
        return this.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      },
    },
    name: {
      type: String,
      required: [true, 'Please enter your name'],
      minlength: 3,
      maxlength: [30, 'Your name cannot exceed 30 Characters'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be longer than 500 characters'],
      default: '',
    },
    email: {
      type: String,
      required: [true, 'Please enter your email'],
      unique: true,
      validate: [validator.isEmail, 'Please enter valid email address'],
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    hasVoted: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'sysadmin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please enter your password'],
      trim: true,
      minlength: [6, 'Your password must be longer than 6 characters'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      trim: true,
      validate: {
        // This only works on .create() or .save()
        validator: function (val) {
          return this.password === val;
        },
        message: "Passwords don't match",
      },
    },
    passwordResetToken: String,
    passwordResetExpiresAt: Date,
    passwordChangedAt: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  // For virtual properties - don't persist in the db (created on the fly when a request is made)
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

/**
 * Mongoose pre-save hook that hashes the user's password when it has been modified.
 *
 * - Generates a bcrypt salt.
 * - Replaces the plain-text password with the hashed value.
 * - Removes `passwordConfirm` so it is not persisted to the database.
 *
 * @this mongoose.Document
 * @returns {Promise<void>}
 */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordConfirm = undefined; // delete passwordConfirm field (does not need to be persistent in the db)
});

/**
 * Mongoose pre-save hook that sets `passwordChangedAt` when the password is
 * modified on an existing document. This is used to invalidate JWTs issued
 * before the password change.
 *
 * @this mongoose.Document
 */
userSchema.pre('save', function () {
  if (!this.isModified('password') || this.isNew) return;
  this.passwordChangedAt = Date.now() - 1000;
});

/**
 * Mongoose pre-find hook that excludes users where `active === false`.
 *
 * This acts as a soft-delete mechanism so inactive users are hidden from
 * normal queries. To include inactive users (for example, in admin/sysadmin
 * views), pass the `bypassActiveFilter` query option when building the query.
 *
 * @example
 * User.find({}, null, { bypassActiveFilter: true })
 *
 * @this mongoose.Query
 * @param {Function} next - Callback to move to the next middleware.
 */
userSchema.pre(/^find/, function (next) {
  const options = this.getOptions ? this.getOptions() : {};

  if (options && options.bypassActiveFilter) {
    return next();
  }

  this.find({ active: { $ne: false } });
  next();
});

/**
 * Compare a candidate password with the user's stored password hash.
 *
 * @async
 * @param {string} inputPassword - Plain-text password from the request body.
 * @param {string} [userPwd] - Optional hashed password to compare against. If
 *   omitted, `this.password` is used.
 * @returns {Promise<boolean>} Resolves to `true` if the passwords match,
 *   otherwise `false`.
 */
userSchema.methods.comparePassword = async function (inputPassword, userPwd) {
  return await bcrypt.compare(inputPassword, userPwd || this.password);
};

/**
 * Determine whether the user changed their password after a JWT was issued.
 *
 * Used to invalidate tokens if the password has been updated since the token
 * was created.
 *
 * @param {number} JWTTimestamp - JWT `iat` timestamp in seconds since epoch.
 * @returns {boolean} `true` if the password was changed after the token was
 *   issued, otherwise `false`.
 */
userSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedAtTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedAtTimestamp;
  }
  return false;
};

/**
 * Generate a signed JSON Web Token for the user.
 *
 * The token payload includes the user's `_id` and `role` and uses the
 * configured `JWT_SECRET` and `JWT_LIFETIME` environment variables.
 *
 * @returns {string} Signed JWT string.
 */
userSchema.methods.signJWT = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
};

/**
 * Create and persist a password reset token for the user.
 *
 * - Generates a random token.
 * - Stores a hashed version on the document in `passwordResetToken`.
 * - Sets `passwordResetExpiresAt` to 30 minutes from now.
 *
 * The unhashed token is returned so it can be sent to the user via email or
 * another delivery mechanism.
 *
 * @returns {string} The plain-text password reset token.
 */
userSchema.methods.generatePasswordResetToken = function () {
  // generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // hash and set to passwordResetToken field in the document
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // set token expiry time - 30 minutes
  this.passwordResetExpiresAt = Date.now() + 30 * 60 * 1000;

  // return unhashed token version
  return resetToken;
};

export default mongoose.model('User', userSchema);
