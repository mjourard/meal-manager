import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCrawlerJobsService, CrawlerJobResponse } from '../../services/crawler-jobs.service';

/**
 * DisplayCrawlerJobs component shows the list of crawler jobs and allows interaction with them.
 * 
 * Implementation notes:
 * - Uses refs to track if jobs have been loaded to prevent continuous API calls
 * - Handles pagination and filtering locally to avoid unnecessary API calls
 * - Only refreshes data when actions are performed
 */
const DisplayCrawlerJobs: React.FC = () => {
  const navigate = useNavigate();
  
  // Use a ref to stabilize the service reference
  const crawlerJobsServiceRef = useRef(useCrawlerJobsService());
  
  const [allJobs, setAllJobs] = useState<CrawlerJobResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  
  // Filter state
  const [showArchived, setShowArchived] = useState<boolean>(false);
  
  // Refs to prevent unnecessary API calls
  const jobsLoaded = useRef(false);
  const requestInProgress = useRef(false);
  const isMounted = useRef(false);
  
  // Fetch all jobs only once when the component mounts
  const fetchAllJobs = useCallback(async () => {
    // Skip if already loaded or request in progress
    if (jobsLoaded.current || requestInProgress.current || !isMounted.current) return;
    
    // Set flag to avoid concurrent requests
    requestInProgress.current = true;
    
    try {
      setLoading(true);
      setError(null);
      
      // Use a large page size to fetch all records at once
      // This assumes we won't have thousands of jobs per user
      const response = await crawlerJobsServiceRef.current.getCrawlerJobs(0, 1000, false);
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        setAllJobs(response.jobs);
        jobsLoaded.current = true;
      }
    } catch (error) {
      console.error('Error fetching crawler jobs:', error);
      if (isMounted.current) {
        setError(`Failed to load crawler jobs: ${error instanceof Error ? error.message : String(error)}`);
        jobsLoaded.current = true;
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      requestInProgress.current = false;
    }
  }, []);

  useEffect(() => {
    // Set mounted flag
    isMounted.current = true;
    
    // Call fetchAllJobs once
    fetchAllJobs();
    
    // Cleanup: reset mounted flag
    return () => {
      isMounted.current = false;
    };
  }, [fetchAllJobs]);

  // Perform actions on jobs (retry, archive)
  const handlePerformAction = async (jobId: number, action: 'retry' | 'archive') => {
    try {
      setMessage(null);
      setError(null);
      
      await crawlerJobsServiceRef.current.performAction(jobId, action);
      
      // Reset loaded flag to trigger a reload
      jobsLoaded.current = false;
      await fetchAllJobs();
      
      setMessage(`Action "${action}" performed successfully on job #${jobId}`);
    } catch (error) {
      setError(`Failed to perform action: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Filter and paginate jobs locally
  const filteredAndPaginatedJobs = useMemo(() => {
    // Filter jobs based on archived status
    const filtered = allJobs.filter(job => showArchived || !job.archived);
    
    // Sort jobs by creation date (newest first)
    const sorted = [...filtered].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Get total number of jobs after filtering
    const total = sorted.length;
    
    // Paginate locally
    const start = currentPage * pageSize;
    const end = Math.min(start + pageSize, total);
    const paginatedJobs = sorted.slice(start, end);
    
    return {
      jobs: paginatedJobs,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize)
    };
  }, [allJobs, showArchived, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleArchiveToggle = () => {
    setShowArchived(!showArchived);
    setCurrentPage(0); // Reset to first page when changing filters
  };

  const handleViewDetails = (jobId: number) => {
    navigate(`/crawler-jobs/${jobId}`);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'PENDING':
        return 'bg-secondary';
      case 'IN_PROGRESS':
        return 'bg-primary';
      case 'SUCCESS':
        return 'bg-success';
      case 'FAILED_RETRYABLE':
        return 'bg-warning';
      case 'FAILED_FOREVER':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;
    const totalPages = filteredAndPaginatedJobs.totalPages;
    
    let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => handlePageChange(i)}
          >
            {i + 1}
          </button>
        </li>
      );
    }
    
    return (
      <nav aria-label="Crawler jobs pagination">
        <ul className="pagination">
          <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageChange(0)}
              disabled={currentPage === 0}
            >
              First
            </button>
          </li>
          <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              Previous
            </button>
          </li>
          
          {pages}
          
          <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
            >
              Next
            </button>
          </li>
          <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={currentPage === totalPages - 1}
            >
              Last
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  if (loading && !jobsLoaded.current) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Crawler Jobs</h2>
        <div className="d-flex align-items-center">
          <div className="form-check form-switch me-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="showArchivedToggle"
              checked={showArchived}
              onChange={handleArchiveToggle}
            />
            <label className="form-check-label" htmlFor="showArchivedToggle">
              Show Archived Jobs
            </label>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/recipes/new')}
          >
            Add New Recipe with URL
          </button>
        </div>
      </div>
      
      {message && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {message}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setMessage(null)}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      {loading && jobsLoaded.current && (
        <div className="alert alert-info" role="alert">
          Refreshing job data...
        </div>
      )}
      
      {filteredAndPaginatedJobs.jobs.length === 0 ? (
        <div className="alert alert-info" role="alert">
          No crawler jobs found. {showArchived ? '' : 'Try showing archived jobs to see more.'}
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Recipe Name</th>
                  <th>URL</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Depth</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndPaginatedJobs.jobs.map(job => (
                  <tr key={job.id} className={job.archived ? 'table-secondary' : ''}>
                    <td>{job.id}</td>
                    <td>{job.recipeName || <em>No name</em>}</td>
                    <td>
                      <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                        {job.url}
                      </a>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td>{formatDate(job.createdAt)}</td>
                    <td>{job.crawlDepth}</td>
                    <td>
                      <div className="btn-group">
                        <button 
                          className="btn btn-sm btn-info"
                          onClick={() => handleViewDetails(job.id)}
                          title="View Details"
                        >
                          View
                        </button>
                        {job.status === 'FAILED_RETRYABLE' && (
                          <button 
                            className="btn btn-sm btn-warning"
                            onClick={() => handlePerformAction(job.id, 'retry')}
                            title="Retry Job"
                          >
                            Retry
                          </button>
                        )}
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => handlePerformAction(job.id, 'archive')}
                          title={job.archived ? "Unarchive Job" : "Archive Job"}
                        >
                          {job.archived ? 'Unarchive' : 'Archive'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              Showing {filteredAndPaginatedJobs.jobs.length} of {filteredAndPaginatedJobs.totalItems} jobs
            </div>
            <div>
              <select 
                className="form-select form-select-sm"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0); // Reset to first page
                }}
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
            {renderPagination()}
          </div>
        </>
      )}
    </div>
  );
};

export default DisplayCrawlerJobs; 