import { useCallback } from 'react';
import { useAuthClient } from './client';

export interface CrawlerJobCreateRequest {
  url: string;
  recipeName: string;
  recipeDescription?: string;
  crawlDepth?: number;
  forceOverrideValidation?: boolean;
}

export interface CrawlerJobActionRequest {
  action: 'retry' | 'archive';
}

export interface CrawlerJobResponse {
  id: number;
  url: string;
  status: string;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  crawlDepth: number;
  archived: boolean;
  recipeId?: number;
  recipeName?: string;
}

export interface CrawlerJobsPageResponse {
  jobs: CrawlerJobResponse[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

// Hook for authenticated crawler job methods
export const useCrawlerJobsService = () => {
  const authClient = useAuthClient();

  const getCrawlerJobs = useCallback(async (
    page: number = 0,
    size: number = 10,
    showArchived: boolean = false
  ): Promise<CrawlerJobsPageResponse> => {
    try {
      const response = await authClient.get('/crawler-jobs', {
        params: { page, size, showArchived }
      });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch crawler jobs: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to fetch crawler jobs: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  const getCrawlerJob = useCallback(async (id: number): Promise<CrawlerJobResponse> => {
    try {
      const response = await authClient.get(`/crawler-jobs/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch crawler job with id ${id}: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to fetch crawler job with id ${id}: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  const createCrawlerJob = useCallback(async (data: CrawlerJobCreateRequest): Promise<CrawlerJobResponse> => {
    try {
      const response = await authClient.post('/crawler-jobs', data);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create crawler job: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to create crawler job: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  const performAction = useCallback(async (id: number, action: 'retry' | 'archive'): Promise<CrawlerJobResponse> => {
    try {
      const data: CrawlerJobActionRequest = { action };
      const response = await authClient.put(`/crawler-jobs/${id}/action`, data);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to perform action on crawler job: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to perform action on crawler job: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  const getCrawledContent = useCallback(async (id: number, path?: string): Promise<string> => {
    try {
      const params = path ? { path } : {};
      const response = await authClient.get(`/crawler-jobs/${id}/content`, { params });
      return response.data.url;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get crawled content URL: ${error.message}`, { cause: error });
      } else {
        throw new Error(`Failed to get crawled content URL: ${JSON.stringify(error)}`);
      }
    }
  }, [authClient]);

  return {
    getCrawlerJobs,
    getCrawlerJob,
    createCrawlerJob,
    performAction,
    getCrawledContent
  };
}; 