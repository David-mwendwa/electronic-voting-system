import path from 'path';
import multer from 'multer';

/**
 * Absolute or relative path to the folder where uploaded files are stored
 * temporarily before being processed or moved elsewhere.
 *
 * In this project it points to the client application's public uploads
 * directory so that uploaded assets can be served statically if needed.
 */
const uploadPath = 'client/public/uploads';

/**
 * Multer disk storage engine configuration.
 *
 * - `destination`: where to write incoming files.
 * - `filename`: how to name the stored file (field name + timestamp + ext).
 */
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

/**
 * Validate that the uploaded file is an image of an allowed type.
 *
 * Allowed extensions/MIME types: jpeg, jpg, png, gif, svg.
 *
 * @param {Express.Multer.File} file - Uploaded file metadata from Multer.
 * @param {Function} cb - Multer callback. Call with `(null, true)` to accept
 *   the file, or with an `Error` instance to reject it.
 * @returns {void}
 */
const checkFileType = function (file, cb) {
  const fileTypes = /jpeg|jpg|png|gif|svg/;
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);
  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        `You can only upload images! (uploaded mimeType:${file.mimetype})`
      )
    );
  }
};

/**
 * Preconfigured Multer instance for handling image uploads.
 *
 * - Stores files on disk using the configured `storage` engine.
 * - Limits file size to 10 MB.
 * - Only accepts image types validated by {@link checkFileType}.
 *
 * Common usage patterns:
 * - Single file: `uploadOptions.single('image')`
 * - Multiple files: `uploadOptions.array('images', 10)`
 */
export const uploadOptions = multer({
  storage,
  limits: { fileSize: 10000000 },
  fileFilter: (req, file, cb) => checkFileType(file, cb),
});
