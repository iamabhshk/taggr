import { Request, Response, NextFunction } from 'express';
import workspaceService from '../services/workspaceService.js';
import { createSuccessResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../config/constants.js';
import { WorkspaceRole } from '../models/Workspace.model.js';

export class WorkspaceController {
  constructor() {
    this.createWorkspace = this.createWorkspace.bind(this);
    this.getWorkspaces = this.getWorkspaces.bind(this);
    this.getWorkspace = this.getWorkspace.bind(this);
    this.updateWorkspace = this.updateWorkspace.bind(this);
    this.deleteWorkspace = this.deleteWorkspace.bind(this);
    this.inviteMember = this.inviteMember.bind(this);
    this.acceptInvite = this.acceptInvite.bind(this);
    this.removeMember = this.removeMember.bind(this);
    this.updateMemberRole = this.updateMemberRole.bind(this);
    this.cancelInvite = this.cancelInvite.bind(this);
    this.getMembers = this.getMembers.bind(this);
    this.leaveWorkspace = this.leaveWorkspace.bind(this);
  }

  /**
   * Create a new workspace
   * POST /api/workspaces
   */
  async createWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const { name, description } = req.body;

      const workspace = await workspaceService.createWorkspace(userId, { name, description });

      res.status(HTTP_STATUS.CREATED).json(
        createSuccessResponse({ workspace })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all workspaces for current user
   * GET /api/workspaces
   */
  async getWorkspaces(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const workspaces = await workspaceService.getUserWorkspaces(userId);

      res.json(createSuccessResponse({ workspaces }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single workspace
   * GET /api/workspaces/:id
   */
  async getWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const { id } = req.params;

      const workspace = await workspaceService.getWorkspaceById(id, userId);

      res.json(createSuccessResponse({ workspace }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update workspace
   * PATCH /api/workspaces/:id
   */
  async updateWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const { id } = req.params;
      const { name, description } = req.body;

      const workspace = await workspaceService.updateWorkspace(id, userId, { name, description });

      res.json(createSuccessResponse({ workspace }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete workspace
   * DELETE /api/workspaces/:id
   */
  async deleteWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const { id } = req.params;

      await workspaceService.deleteWorkspace(id, userId);

      res.json(createSuccessResponse(null, 'Workspace deleted'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Invite member to workspace
   * POST /api/workspaces/:id/invites
   */
  async inviteMember(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const { id } = req.params;
      const { email, role } = req.body;

      const invite = await workspaceService.inviteMember(id, userId, email, role as WorkspaceRole);

      res.status(HTTP_STATUS.CREATED).json(
        createSuccessResponse({ invite })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Accept workspace invite
   * POST /api/workspaces/invites/:token/accept
   */
  async acceptInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const { token } = req.params;

      const workspace = await workspaceService.acceptInvite(token, userId);

      res.json(createSuccessResponse({ workspace }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove member from workspace
   * DELETE /api/workspaces/:id/members/:memberId
   */
  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const { id, memberId } = req.params;

      await workspaceService.removeMember(id, userId, memberId);

      res.json(createSuccessResponse(null, 'Member removed'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update member role
   * PATCH /api/workspaces/:id/members/:memberId
   */
  async updateMemberRole(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const { id, memberId } = req.params;
      const { role } = req.body;

      await workspaceService.updateMemberRole(id, userId, memberId, role as WorkspaceRole);

      res.json(createSuccessResponse(null, 'Role updated'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel pending invite
   * DELETE /api/workspaces/:id/invites/:email
   */
  async cancelInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const { id, email } = req.params;

      await workspaceService.cancelInvite(id, userId, email);

      res.json(createSuccessResponse(null, 'Invite cancelled'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get workspace members
   * GET /api/workspaces/:id/members
   */
  async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const { id } = req.params;

      const data = await workspaceService.getWorkspaceMembers(id, userId);

      res.json(createSuccessResponse(data));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Leave workspace
   * POST /api/workspaces/:id/leave
   */
  async leaveWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const { id } = req.params;

      await workspaceService.leaveWorkspace(id, userId);

      res.json(createSuccessResponse(null, 'Left workspace'));
    } catch (error) {
      next(error);
    }
  }
}

export default new WorkspaceController();

