import { Router } from 'express';
import workspaceController from '../controllers/workspaceController.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Workspace CRUD
router.post('/', workspaceController.createWorkspace);
router.get('/', workspaceController.getWorkspaces);
router.get('/:id', workspaceController.getWorkspace);
router.patch('/:id', workspaceController.updateWorkspace);
router.delete('/:id', workspaceController.deleteWorkspace);

// Members
router.get('/:id/members', workspaceController.getMembers);
router.delete('/:id/members/:memberId', workspaceController.removeMember);
router.patch('/:id/members/:memberId', workspaceController.updateMemberRole);

// Invites
router.post('/:id/invites', workspaceController.inviteMember);
router.delete('/:id/invites/:email', workspaceController.cancelInvite);

// Accept invite (different path structure)
router.post('/invites/:token/accept', workspaceController.acceptInvite);

// Leave workspace
router.post('/:id/leave', workspaceController.leaveWorkspace);

export default router;

