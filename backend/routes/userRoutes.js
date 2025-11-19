import express from 'express';
const router = express.Router();

import {
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  logout,
  updateMe,
} from '../controllers/userController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

/******************[ USER ROUTES ]******************/
router.route('/logout').get(logout);
router.route('/me').patch(authenticate, updateMe);

/******************[ ADMIN ROUTES ]******************/
router.route('/').get(authenticate, authorizeRoles('admin'), getUsers);
router
  .route('/:id')
  .get(authenticate, authorizeRoles('admin'), getUser)
  .patch(authenticate, authorizeRoles('admin'), updateUser)
  .delete(authenticate, authorizeRoles('admin'), deleteUser);

export default router;
