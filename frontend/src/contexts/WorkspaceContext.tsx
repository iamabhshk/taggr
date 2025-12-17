import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import workspaceService, { Workspace } from '@/services/workspaceService';
import { useAuth } from '@/hooks/useAuth';

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  isLoading: boolean;
  refetchWorkspaces: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null);

  const {
    data: workspacesData,
    isLoading,
    refetch: refetchWorkspaces,
  } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceService.getWorkspaces(),
    enabled: !!user,
  });

  const workspaces = workspacesData?.workspaces || [];

  // Load saved workspace from localStorage
  useEffect(() => {
    if (workspaces.length > 0 && !currentWorkspace) {
      const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
      const savedWorkspace = workspaces.find((w) => w._id === savedWorkspaceId);
      if (savedWorkspace) {
        setCurrentWorkspaceState(savedWorkspace);
      }
    }
  }, [workspaces, currentWorkspace]);

  const setCurrentWorkspace = (workspace: Workspace | null) => {
    setCurrentWorkspaceState(workspace);
    if (workspace) {
      localStorage.setItem('currentWorkspaceId', workspace._id);
    } else {
      localStorage.removeItem('currentWorkspaceId');
    }
    // Invalidate labels query when workspace changes
    queryClient.invalidateQueries({ queryKey: ['labels'] });
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        setCurrentWorkspace,
        isLoading,
        refetchWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

