import { useCallback } from 'react';
import { CreateSysUser, UpdateSysUser, DisplaySysUser } from "../models/sys-user";
import { useAuthClient } from './client';

export const useSysUsersService = () => {
  const authClient = useAuthClient();

  const getAll = useCallback(async (): Promise<DisplaySysUser[]> => {
    try {
      const response = await authClient.get('/users');
      if (response.status === 204) {
        return [];
      }
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch SysUsers: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to fetch SysUsers: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  const getDefaultChecked = useCallback(async (): Promise<DisplaySysUser[]> => {
    try {
      const response = await authClient.get('/users/defaultchecked');
      if (response.status === 204) {
        return [];
      }
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch default checked SysUsers: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to fetch default checked SysUsers: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  const get = useCallback(async (id: number): Promise<DisplaySysUser> => {
    try {
      const response = await authClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch SysUser with id ${id}: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to fetch SysUser with id ${id}: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  const create = useCallback(async (data: CreateSysUser): Promise<DisplaySysUser> => {
    try {
      const response = await authClient.post('/users', data);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create SysUser: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to create SysUser: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  const update = useCallback(async (id: number, data: UpdateSysUser): Promise<DisplaySysUser> => {
    try {
      const response = await authClient.put(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update SysUser with id ${id}: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to update SysUser with id ${id}: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  const updateDefaultChecked = useCallback(async (id: number, defaultChecked: boolean): Promise<DisplaySysUser> => {
    try {
      const response = await authClient.put(`/users/${id}/defaultchecked`, { defaultChecked });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update default checked status for SysUser with id ${id}: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to update default checked status for SysUser with id ${id}: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  const deleteUser = useCallback(async (id: number): Promise<void> => {
    try {
      await authClient.delete(`/users/${id}`);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete SysUser with id ${id}: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to delete SysUser with id ${id}: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  return {
    getAll,
    getDefaultChecked,
    get,
    create,
    update,
    updateDefaultChecked,
    delete: deleteUser
  };
}; 