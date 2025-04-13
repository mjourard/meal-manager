import React, { useState, useEffect } from 'react';
import BuildInfoService, { BuildInfo } from '../../services/BuildInfoService';

const BuildInfoPage: React.FC = () => {
  const [buildInfo, setBuildInfo] = useState<BuildInfo>({
    version: 'Loading...',
    buildTimestamp: 'Loading...',
    environment: 'Loading...',
    apiUrl: 'Loading...'
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const clientVersion = import.meta.env.VITE_APP_VERSION || 'Unknown';

  useEffect(() => {
    const fetchBuildInfo = async () => {
      try {
        const data = await BuildInfoService.getBuildInfo();
        setBuildInfo(data);
        setLoading(false);
      } catch {
        setError('Failed to load build information. Please try again later.');
        setLoading(false);
      }
    };

    fetchBuildInfo();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <h3>Build Information</h3>
      </header>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Application Versions</h5>
          <table className="table">
            <tbody>
              <tr>
                <th scope="row">Client Version</th>
                <td>{clientVersion}</td>
              </tr>
              <tr>
                <th scope="row">API Version</th>
                <td>{buildInfo.version}</td>
              </tr>
              <tr>
                <th scope="row">Build Timestamp</th>
                <td>{buildInfo.buildTimestamp}</td>
              </tr>
              <tr>
                <th scope="row">Environment</th>
                <td>{buildInfo.environment}</td>
              </tr>
              <tr>
                <th scope="row">API URL</th>
                <td>{buildInfo.apiUrl}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BuildInfoPage; 