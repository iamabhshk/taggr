import api from './api';

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface WorkspaceMember {
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
  email?: string;
  displayName?: string;
  avatar?: string;
}

export interface WorkspaceInvite {
  email: string;
  role: WorkspaceRole;
  expiresAt: string;
  createdAt: string;
}

export interface Workspace {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  avatar?: string;
  ownerId: string;
  members: WorkspaceMember[];
  pendingInvites: WorkspaceInvite[];
  settings: {
    defaultRole: WorkspaceRole;
    allowMemberInvites: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export const workspaceService = {
  // Get all workspaces for current user
  getWorkspaces: async () => {
    return api.get<{ workspaces: Workspace[] }>('/workspaces');
  },

  // Get single workspace
  getWorkspace: async (id: string) => {
    return api.get<{ workspace: Workspace }>(`/workspaces/${id}`);
  },

  // Create workspace
  createWorkspace: async (data: { name: string; description?: string }) => {
    return api.post<{ workspace: Workspace }>('/workspaces', data);
  },

  // Update workspace
  updateWorkspace: async (id: string, data: { name?: string; description?: string }) => {
    return api.patch<{ workspace: Workspace }>(`/workspaces/${id}`, data);
  },

  // Delete workspace
  deleteWorkspace: async (id: string) => {
    return api.delete(`/workspaces/${id}`);
  },

  // Get workspace members
  getMembers: async (id: string) => {
    return api.get<{ members: WorkspaceMember[]; pendingInvites: WorkspaceInvite[] }>(
      `/workspaces/${id}/members`
    );
  },

  // Invite member
  inviteMember: async (id: string, email: string, role: WorkspaceRole) => {
    return api.post<{ invite: { token: string; expiresAt: string } }>(
      `/workspaces/${id}/invites`,
      { email, role }
    );
  },

  // Accept invite
  acceptInvite: async (token: string) => {
    return api.post<{ workspace: Workspace }>(`/workspaces/invites/${token}/accept`);
  },

  // Remove member
  removeMember: async (workspaceId: string, memberId: string) => {
    return api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
  },

  // Update member role
  updateMemberRole: async (workspaceId: string, memberId: string, role: WorkspaceRole) => {
    return api.patch(`/workspaces/${workspaceId}/members/${memberId}`, { role });
  },

  // Cancel invite
  cancelInvite: async (workspaceId: string, email: string) => {
    return api.delete(`/workspaces/${workspaceId}/invites/${encodeURIComponent(email)}`);
  },

  // Leave workspace
  leaveWorkspace: async (id: string) => {
    return api.post(`/workspaces/${id}/leave`);
  },
};

export default workspaceService;

