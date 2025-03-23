import { SysUser } from "../models/sys-user";
import http from "./client";

class SysUsersDataService {
    async getAll(): Promise<SysUser[]> {
        try {
            const response = await http.get("/sysusers");
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch SysUsers: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to fetch SysUsers: ${JSON.stringify(error)}`);
            }
        }
    }

    async get(id: number): Promise<SysUser> {
        try {
            const response = await http.get(`/sysusers/${id}`);
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch SysUser with id ${id}: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to fetch SysUser with id ${id}: ${JSON.stringify(error)}`);
            }
        }
    }

    async create(data: SysUser): Promise<SysUser> {
        try {
            const response = await http.post("/sysusers", data);
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to create SysUser: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to create SysUser: ${JSON.stringify(error)}`);
            }
        }
    }

    async update(id: number, data: SysUser): Promise<SysUser> {
        try {
            const response = await http.put(`/sysusers/${id}`, data);
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to update SysUser with id ${id}: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to update SysUser with id ${id}: ${JSON.stringify(error)}`);
            }
        }
    }

    async delete(id: number): Promise<void> {
        try {
            await http.delete(`/sysusers/${id}`);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to delete SysUser with id ${id}: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to delete SysUser with id ${id}: ${JSON.stringify(error)}`);
            }
        }
    }

    async updateDefaultChecked(id: number, defaultChecked: boolean): Promise<SysUser> {
        try {
            const response = await http.put(`/sysusers/${id}/defaultchecked`, { defaultChecked });
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to update default checked status for SysUser with id ${id}: ${error.message}`, { cause: error });
            } else {
                throw new Error(`Failed to update default checked status for SysUser with id ${id}: ${JSON.stringify(error)}`);
            }
        }
    }
}

export default new SysUsersDataService(); 