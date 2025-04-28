import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCrawlerJobsService, CrawlerJobResponse } from '../../services/crawler-jobs.service';

/**
 * CrawlerJobDetails component shows the details of a specific crawler job.
 * 
 * Implementation notes:
 * - Uses refs to track if job details have been loaded to prevent continuous API calls
 * - Stabilizes service reference with useRef to prevent re-creation
 * - Only refreshes data when actions are performed
 */
const CrawlerJobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Use a ref to stabilize the service reference
  const crawlerJobsServiceRef = useRef(useCrawlerJobsService());
  
  const [job, setJob] = useState<CrawlerJobResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [performingAction, setPerformingAction] = useState<boolean>(false);
  
  // Refs to prevent unnecessary API calls
  const jobLoaded = useRef(false);
  const requestInProgress = useRef(false);
  const isMounted = useRef(false);
  
  const fetchJobDetails = useCallback(async () => {
    if (!id) return;
    
    // Skip if already loaded or request in progress
    if (jobLoaded.current || requestInProgress.current || !isMounted.current) return;
    
    // Set flag to avoid concurrent requests
    requestInProgress.current = true;
    
    try {
      setLoading(true);
      setError(null);
      
      const jobData = await crawlerJobsServiceRef.current.getCrawlerJob(parseInt(id));
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        setJob(jobData);
        jobLoaded.current = true;
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      if (isMounted.current) {
        setError(`Failed to load job details: ${error instanceof Error ? error.message : String(error)}`);
        jobLoaded.current = true;
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      requestInProgress.current = false;
    }
  }, [id]);

  const handlePerformAction = async (actionType: 'retry' | 'archive') => {
    if (!id) return;
    
    try {
      setPerformingAction(true);
      setMessage(null);
      setError(null);
      
      await crawlerJobsServiceRef.current.performAction(parseInt(id), actionType);
      
      // Reset loaded flag to trigger a reload
      jobLoaded.current = false;
      await fetchJobDetails();
      
      setMessage(`Action "${actionType}" performed successfully`);
    } catch (error) {
      setError(`Failed to perform action: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setPerformingAction(false);
    }
  };

  useEffect(() => {
    // Set mounted flag
    isMounted.current = true;
    
    // Call fetchJobDetails once
    fetchJobDetails();
    
    // Cleanup: reset mounted flag
    return () => {
      isMounted.current = false;
    };
  }, [fetchJobDetails]);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading && !jobLoaded.current) {
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
      
      {loading && jobLoaded.current && (
        <div className="alert alert-info" role="alert">
          Refreshing job data...
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