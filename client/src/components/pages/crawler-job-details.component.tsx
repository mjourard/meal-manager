import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCrawlerJobsService, CrawlerJobResponse } from '../../services/crawler-jobs.service';

const CrawlerJobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const crawlerJobsService = useCrawlerJobsService();
  
  const [job, setJob] = useState<CrawlerJobResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [performingAction, setPerformingAction] = useState<boolean>(false);
  
  const fetchJobDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const jobData = await crawlerJobsService.getCrawlerJob(parseInt(id));
      setJob(jobData);
    } catch (error) {
      console.error('Error fetching job details:', error);
      setError(`Failed to load job details: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePerformAction = async (actionType: 'retry' | 'archive') => {
    if (!id) return;
    
    try {
      setPerformingAction(true);
      setMessage(null);
      setError(null);
      
      await crawlerJobsService.performAction(parseInt(id), actionType);
      
      // Refresh job data after action
      await fetchJobDetails();
      setMessage(`Action "${actionType}" performed successfully`);
    } catch (error) {
      setError(`Failed to perform action: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setPerformingAction(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id, fetchJobDetails]);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <button 
          className="btn btn-primary mt-3" 
          onClick={() => navigate('/crawler-jobs')}
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning" role="alert">
          Job not found
        </div>
        <button 
          className="btn btn-primary mt-3" 
          onClick={() => navigate('/crawler-jobs')}
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Crawler Job Details</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/crawler-jobs')}
        >
          Back to Jobs
        </button>
      </div>
      
      {message && (
        <div className="alert alert-success" role="alert">
          {message}
        </div>
      )}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header">
              <h4>Job Information</h4>
            </div>
            <div className="card-body">
              <h5>URL</h5>
              <p className="mb-3">
                <a href={job.url} target="_blank" rel="noopener noreferrer">
                  {job.url}
                </a>
              </p>
              
              <div className="mb-3">
                <h5>Recipe Details</h5>
                {job.recipeName ? (
                  <p className="mb-1"><strong>Name:</strong> {job.recipeName}</p>
                ) : (
                  <p className="text-gray-500 italic">No recipe information available</p>
                )}
              </div>
              
              <div className="mb-3">
                <h5>Job Status</h5>
                <p className="mb-1"><strong>Status:</strong> {job.status}</p>
                <p className="mb-1"><strong>Created:</strong> {formatDate(job.createdAt)}</p>
                <p className="mb-1"><strong>Started:</strong> {formatDate(job.startedAt)}</p>
                <p className="mb-1"><strong>Finished:</strong> {formatDate(job.finishedAt)}</p>
                <p className="mb-1"><strong>Crawl Depth:</strong> {job.crawlDepth || 'Default'}</p>
                {job.errorCode && (
                  <div className="alert alert-danger mt-2">
                    <strong>Error Code:</strong> {job.errorCode}
                  </div>
                )}
                {job.errorMessage && (
                  <div className="alert alert-danger mt-2">
                    <strong>Error Message:</strong> {job.errorMessage}
                  </div>
                )}
              </div>
              
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-warning" 
                  onClick={() => handlePerformAction('retry')}
                  disabled={performingAction}
                >
                  {performingAction ? 'Processing...' : 'Retry Job'}
                </button>
                
                <button 
                  className="btn btn-secondary" 
                  onClick={() => handlePerformAction('archive')}
                  disabled={performingAction}
                >
                  {performingAction ? 'Processing...' : job.archived ? 'Unarchive' : 'Archive'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrawlerJobDetails; 