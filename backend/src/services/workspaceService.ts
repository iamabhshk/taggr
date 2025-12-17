import crypto from 'crypto';
import Workspace, { IWorkspace, WorkspaceRole } from '../models/Workspace.model.js';
import User from '../models/User.model.js';
import { NotFoundError, ForbiddenError, ConflictError, ValidationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export class WorkspaceService {
  /**
   * Generate a unique slug from workspace name
   */
  private async generateSlug(name: string): Promise<string> {
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);

    // Check if slug exists and add suffix if needed
    let finalSlug = slug;
    let counter = 1;
    while (await Workspace.findOne({ slug: finalSlug })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    return finalSlug;
  }

  /**
   * Generate invite token
   */
  private generateInviteToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Check if user has required role in workspace
   */
  async checkPermission(
    workspaceId: string,
    userId: string,
    requiredRoles: WorkspaceRole[]
  ): Promise<{ workspace: IWorkspace; role: WorkspaceRole }> {
    const user = await User.findOne({ uid: userId });
    if (!user) {
      throw new NotFoundError('User');
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError('Workspace');
    }

    const member = workspace.members.find(
      (m) => m.userId.toString() === user._id.toString()
    );

    if (!member) {
      throw new ForbiddenError('You are not a member of this workspace');
    }

    if (!requiredRoles.includes(member.role)) {
      throw new ForbiddenError(`This action requires one of these roles: ${requiredRoles.join(', ')}`);
    }

    return { workspace, role: member.role };
  }

  /**
   * Create a new workspace
   */
  async createWorkspace(
    userId: string,
    data: { name: string; description?: string }
  ): Promise<IWorkspace> {
    const user = await User.findOne({ uid: userId });
    if (!user) {
      throw new NotFoundError('User');
    }

    const slug = await this.generateSlug(data.name);

    const workspace = await Workspace.create({
      name: data.name,
      slug,
      description: data.description || '',
      ownerId: user._id,
      members: [
        {
          userId: user._id,
          role: 'owner',
          joinedAt: new Date(),
        },
      ],
    });

    logger.info(`Workspace created: ${workspace.name} by user ${userId}`);
    return workspace;
  }

  /**
   * Get all workspaces for a user
   */
  async getUserWorkspaces(userId: string): Promise<IWorkspace[]> {
    const user = await User.findOne({ uid: userId });
    if (!user) {
      throw new NotFoundError('User');
    }

    const workspaces = await Workspace.find({
      'members.userId': user._id,
    }).sort({ createdAt: -1 });

    return workspaces;
  }

  /**
   * Get workspace by ID
   */
  async getWorkspaceById(workspaceId: string, userId: string): Promise<IWorkspace> {
    const { workspace } = await this.checkPermission(workspaceId, userId, [
      'owner',
      'admin',
      'editor',
      'viewer',
    ]);
    return workspace;
  }

  /**
   * Update workspace
   */
  async updateWorkspace(
    workspaceId: string,
    userId: string,
    data: { name?: string; description?: string }
  ): Promise<IWorkspace> {
    const { workspace } = await this.checkPermission(workspaceId, userId, ['owner', 'admin']);

    if (data.name) {
      workspace.name = data.name;
    }
    if (data.description !== undefined) {
      workspace.description = data.description;
    }

    await workspace.save();
    return workspace;
  }

  /**
   * Delete workspace
   */
  async deleteWorkspace(workspaceId: string, userId: string): Promise<void> {
    const { workspace } = await this.checkPermission(workspaceId, userId, ['owner']);
    await Workspace.findByIdAndDelete(workspaceId);
    logger.info(`Workspace deleted: ${workspace.name} by user ${userId}`);
  }

  /**
   * Invite member to workspace
   */
  async inviteMember(
    workspaceId: string,
    userId: string,
    email: string,
    role: WorkspaceRole = 'editor'
  ): Promise<{ token: string; expiresAt: Date }> {
    const { workspace } = await this.checkPermission(workspaceId, userId, ['owner', 'admin']);
    const inviter = await User.findOne({ uid: userId });

    // Check if email is already a member
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const isMember = workspace.members.some(
        (m) => m.userId.toString() === existingUser._id.toString()
      );
      if (isMember) {
        throw new ConflictError('User is already a member of this workspace');
      }
    }

    // Check if invite already exists
    const existingInvite = workspace.pendingInvites.find(
      (i) => i.email === email.toLowerCase()
    );
    if (existingInvite) {
      throw new ConflictError('An invite has already been sent to this email');
    }

    // Can't invite as owner
    if (role === 'owner') {
      throw new ValidationError('Cannot invite as owner');
    }

    const token = this.generateInviteToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    workspace.pendingInvites.push({
      email: email.toLowerCase(),
      role,
      token,
      invitedBy: inviter!._id,
      expiresAt,
      createdAt: new Date(),
    });

    await workspace.save();

    logger.info(`Invite sent to ${email} for workspace ${workspace.name}`);
    return { token, expiresAt };
  }

  /**
   * Accept workspace invite
   */
  async acceptInvite(token: string, userId: string): Promise<IWorkspace> {
    const user = await User.findOne({ uid: userId });
    if (!user) {
      throw new NotFoundError('User');
    }

    const workspace = await Workspace.findOne({
      'pendingInvites.token': token,
    });

    if (!workspace) {
      throw new NotFoundError('Invite not found or expired');
    }

    const invite = workspace.pendingInvites.find((i) => i.token === token);
    if (!invite) {
      throw new NotFoundError('Invite not found');
    }

    if (invite.expiresAt < new Date()) {
      // Remove expired invite
      workspace.pendingInvites = workspace.pendingInvites.filter((i) => i.token !== token);
      await workspace.save();
      throw new ValidationError('Invite has expired');
    }

    // Check email matches
    if (invite.email !== user.email.toLowerCase()) {
      throw new ForbiddenError('This invite was sent to a different email address');
    }

    // Add member
    workspace.members.push({
      userId: user._id,
      role: invite.role,
      joinedAt: new Date(),
      invitedBy: invite.invitedBy,
    });

    // Remove invite
    workspace.pendingInvites = workspace.pendingInvites.filter((i) => i.token !== token);

    await workspace.save();

    logger.info(`User ${user.email} joined workspace ${workspace.name}`);
    return workspace;
  }

  /**
   * Remove member from workspace
   */
  async removeMember(
    workspaceId: string,
    userId: string,
    memberUserId: string
  ): Promise<void> {
    const { workspace, role } = await this.checkPermission(workspaceId, userId, ['owner', 'admin']);
    
    const memberToRemove = workspace.members.find(
      (m) => m.userId.toString() === memberUserId
    );

    if (!memberToRemove) {
      throw new NotFoundError('Member not found in workspace');
    }

    // Can't remove owner
    if (memberToRemove.role === 'owner') {
      throw new ForbiddenError('Cannot remove the workspace owner');
    }

    // Admins can only remove editors and viewers
    if (role === 'admin' && memberToRemove.role === 'admin') {
      throw new ForbiddenError('Admins cannot remove other admins');
    }

    workspace.members = workspace.members.filter(
      (m) => m.userId.toString() !== memberUserId
    );

    await workspace.save();
    logger.info(`Member ${memberUserId} removed from workspace ${workspace.name}`);
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    workspaceId: string,
    userId: string,
    memberUserId: string,
    newRole: WorkspaceRole
  ): Promise<void> {
    const { workspace } = await this.checkPermission(workspaceId, userId, ['owner', 'admin']);
    const actor = await User.findOne({ uid: userId });

    const member = workspace.members.find(
      (m) => m.userId.toString() === memberUserId
    );

    if (!member) {
      throw new NotFoundError('Member not found in workspace');
    }

    // Can't change owner role
    if (member.role === 'owner') {
      throw new ForbiddenError('Cannot change the owner role');
    }

    // Can't promote to owner
    if (newRole === 'owner') {
      throw new ForbiddenError('Cannot promote to owner');
    }

    // Admins can't promote to admin
    const actorMember = workspace.members.find(
      (m) => m.userId.toString() === actor!._id.toString()
    );
    if (actorMember?.role === 'admin' && newRole === 'admin') {
      throw new ForbiddenError('Admins cannot promote others to admin');
    }

    member.role = newRole;
    await workspace.save();

    logger.info(`Member ${memberUserId} role updated to ${newRole} in workspace ${workspace.name}`);
  }

  /**
   * Cancel pending invite
   */
  async cancelInvite(workspaceId: string, userId: string, email: string): Promise<void> {
    const { workspace } = await this.checkPermission(workspaceId, userId, ['owner', 'admin']);

    workspace.pendingInvites = workspace.pendingInvites.filter(
      (i) => i.email !== email.toLowerCase()
    );

    await workspace.save();
    logger.info(`Invite to ${email} cancelled for workspace ${workspace.name}`);
  }

  /**
   * Get workspace members with user details
   */
  async getWorkspaceMembers(workspaceId: string, userId: string) {
    const { workspace } = await this.checkPermission(workspaceId, userId, [
      'owner',
      'admin',
      'editor',
      'viewer',
    ]);

    const memberIds = workspace.members.map((m) => m.userId);
    const users = await User.find({ _id: { $in: memberIds } });

    const members = workspace.members.map((m) => {
      const user = users.find((u) => u._id.toString() === m.userId.toString());
      return {
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt,
        email: user?.email,
        displayName: user?.displayName,
        avatar: user?.avatar,
      };
    });

    return {
      members,
      pendingInvites: workspace.pendingInvites.map((i) => ({
        email: i.email,
        role: i.role,
        expiresAt: i.expiresAt,
        createdAt: i.createdAt,
      })),
    };
  }

  /**
   * Leave workspace
   */
  async leaveWorkspace(workspaceId: string, userId: string): Promise<void> {
    const user = await User.findOne({ uid: userId });
    if (!user) {
      throw new NotFoundError('User');
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError('Workspace');
    }

    const member = workspace.members.find(
      (m) => m.userId.toString() === user._id.toString()
    );

    if (!member) {
      throw new NotFoundError('You are not a member of this workspace');
    }

    if (member.role === 'owner') {
      throw new ForbiddenError('Owner cannot leave the workspace. Transfer ownership or delete the workspace.');
    }

    workspace.members = workspace.members.filter(
      (m) => m.userId.toString() !== user._id.toString()
    );

    await workspace.save();
    logger.info(`User ${user.email} left workspace ${workspace.name}`);
  }
}

export default new WorkspaceService();

