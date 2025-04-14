import { useCallback } from 'react';
import { publicClient } from './client';

export interface BuildInfo {
    version: string;
    buildTimestamp: string;
    environment: string;
    apiUrl: string;
}

// Hook for build info methods
export const useBuildInfoService = () => {
    const getBuildInfo = useCallback(async (): Promise<BuildInfo> => {
        try {
            const response = await publicClient.get('/buildinfo');
            return response.data;
        } catch (error) {
            console.error('Error fetching build info:', error);
            return {
                version: 'Error',
                buildTimestamp: 'Error',
                environment: 'Error',
                apiUrl: 'Error'
            };
        }
    }, []);

    return {
        getBuildInfo
    };
}; 