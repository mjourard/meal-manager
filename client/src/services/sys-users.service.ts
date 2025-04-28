import { useCallback } from 'react';
import { CreateSysUser, UpdateSysUser, DisplaySysUser } from "../models/sys-user";
import { useAuthClient } from './client';
import { logger } from './logging.service'; // Import the global logger

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
      // Since there's no specific endpoint for defaultChecked users,
      // fetch all users and filter the ones with defaultChecked=true
      logger.debug('Fetching all users to filter defaultChecked', 'SysUsersService');
      const allUsers = await getAll();
      const defaultCheckedUsers = allUsers.filter(user => user.defaultChecked === true);
      logger.debug(`Found ${defaultCheckedUsers.length} defaultChecked users out of ${allUsers.length} total users`, 'SysUsersService');
      return defaultCheckedUsers;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch default checked SysUsers: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to fetch default checked SysUsers: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient, getAll]);

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
      if (response.status === 204) {
        // If no content returned, return the data that was sent
        return { ...data, id } as DisplaySysUser;
      }
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
      if (response.status === 204) {
        // If no content returned, construct a minimal response
        return { id, defaultChecked } as DisplaySysUser;
      }
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