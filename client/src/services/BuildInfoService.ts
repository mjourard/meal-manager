import axios from 'axios';

export interface BuildInfo {
    version: string;
    buildTimestamp: string;
    environment: string;
    apiUrl: string;
}

class BuildInfoService {
    async getBuildInfo(): Promise<BuildInfo> {
        try {
            const response = await axios.get('/api/buildinfo');
            return response.data;
        } catch (error) {
            console.error('Error fetching build info:', error);
            return {
                version: 'Unknown',
                buildTimestamp: 'Unknown',
                environment: 'Unknown',
                apiUrl: 'Unknown'
            };
        }
    }
}

export default new BuildInfoService(); 