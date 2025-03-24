import { CreateType, UpdateType, DisplayType } from './utility-types';

export interface SysUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    defaultChecked: boolean;
}

export type CreateSysUser = CreateType<SysUser>;
export type UpdateSysUser = UpdateType<SysUser>;
export type DisplaySysUser = DisplayType<SysUser>;