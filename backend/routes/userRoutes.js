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

/******************[ AUTHENTICATED USER ROUTES ]******************/
router.route('/logout').get(logout);
router.route('/me').patch(authenticate, updateMe);

/******************[ ADMIN ROUTES ]******************/
// Sysadmin can manage all users, admin can only view
router
  .route('/')
  .get(authenticate, authorizeRoles(['admin', 'sysadmin']), getUsers);

/******************[ SYSADMIN ROUTES ]******************/
router
  .route('/:id')
  .get(authenticate, authorizeRoles(['admin', 'sysadmin']), getUser)
  .patch(authenticate, authorizeRoles(['admin', 'sysadmin']), updateUser)
  .delete(authenticate, authorizeRoles(['sysadmin']), deleteUser);

export default router;
