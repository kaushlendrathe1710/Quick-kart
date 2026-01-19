import { Express } from 'express';
import { authenticate, isAdmin } from '../../middleware/auth.middleware';
import * as userController from '../../controllers/admin/user.controller';

export function registerAdminUserRoutes(app: Express) {
  // User Management
  app.get('/api/admin/users', authenticate, isAdmin, userController.getAllUsers);
  app.get('/api/admin/users/stats', authenticate, isAdmin, userController.getUserStats);
  app.get('/api/admin/users/:id', authenticate, isAdmin, userController.getUserById);
  app.put('/api/admin/users/:id', authenticate, isAdmin, userController.updateUser);
  app.put('/api/admin/users/:id/role', authenticate, isAdmin, userController.updateUserRole);
  app.delete('/api/admin/users/:id', authenticate, isAdmin, userController.deleteUser);
  app.post('/api/admin/users/:id/recover', authenticate, isAdmin, userController.recoverUser);
}
