import {
  ApiResponse,
  PaginatedResponse,
  PresignedUrlResponse,
  Swing,
  Comparison,
} from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper function to create authenticated API calls
export function createAuthenticatedApi(token: string) {
  return {
    swings: {
      getLibrary: (page = 1, limit = 20) =>
        apiRequest<PaginatedResponse<Swing>>(
          `/swings?page=${page}&limit=${limit}`,
          { token }
        ),

      getSwing: (id: string) =>
        apiRequest<ApiResponse<Swing>>(`/swings/${id}`, { token }),

      createSwing: (swingData: Partial<Swing>) =>
        apiRequest<ApiResponse<Swing>>('/swings', {
          method: 'POST',
          body: JSON.stringify(swingData),
          token,
        }),

      updateSwing: (id: string, swingData: Partial<Swing>) =>
        apiRequest<ApiResponse<Swing>>(`/swings/${id}`, {
          method: 'PUT',
          body: JSON.stringify(swingData),
          token,
        }),

      deleteSwing: (id: string) =>
        apiRequest<ApiResponse<null>>(`/swings/${id}`, {
          method: 'DELETE',
          token,
        }),

      getPresignedUrl: (fileName: string, fileType: string) =>
        apiRequest<ApiResponse<PresignedUrlResponse>>('/upload-url', {
          method: 'POST',
          body: JSON.stringify({ filename: fileName, contentType: fileType }),
          token,
        }),

      uploadVideo: async (
        presignedUrl: string,
        file: File,
        fields: Record<string, string>
      ) => {
        console.log('Uploading to S3 with FormData:', {
          presignedUrl: presignedUrl.substring(0, 100) + '...',
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fields,
        });

        // Validate required fields for S3 POST
        const requiredFields = ['key', 'AWSAccessKeyId', 'policy', 'signature'];
        const missingFields = requiredFields.filter(field => !fields[field]);

        if (missingFields.length > 0) {
          console.error('❌ Missing required S3 fields:', missingFields);
          console.error('Available fields:', Object.keys(fields));
          throw new Error(
            `Missing required S3 fields: ${missingFields.join(', ')}`
          );
        }

        const formData = new FormData();

        // Add the fields first (order matters for S3!)
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, value);
          console.log(`📤 Adding field: ${key} = ${value}`);
        });

        // Add the file last
        formData.append('file', file);
        console.log('📤 Adding file:', file.name);

        console.log('📤 Full presigned URL:', presignedUrl);

        const response = await fetch(presignedUrl, {
          method: 'POST',
          body: formData,
        });

        console.log('S3 Upload Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('S3 Upload Error:', errorText);
          throw new ApiError(
            response.status,
            `Upload failed: ${response.statusText}`
          );
        }

        return response;
      },
    },

    comparisons: {
      getComparisons: () =>
        apiRequest<ApiResponse<Comparison[]>>('/comparisons', { token }),

      getComparison: (id: string) =>
        apiRequest<ApiResponse<Comparison>>(`/comparisons/${id}`, { token }),

      createComparison: (comparisonData: Partial<Comparison>) =>
        apiRequest<ApiResponse<Comparison>>('/comparisons', {
          method: 'POST',
          body: JSON.stringify(comparisonData),
          token,
        }),

      updateComparison: (id: string, comparisonData: Partial<Comparison>) =>
        apiRequest<ApiResponse<Comparison>>(`/comparisons/${id}`, {
          method: 'PUT',
          body: JSON.stringify(comparisonData),
          token,
        }),

      deleteComparison: (id: string) =>
        apiRequest<ApiResponse<null>>(`/comparisons/${id}`, {
          method: 'DELETE',
          token,
        }),
    },

    poseAnalysis: {
      generateSnapshots: (swingId: string) =>
        apiRequest<ApiResponse<{ taskId: string; status: string }>>(
          `/swings/${swingId}/snapshots/generate`,
          {
            method: 'POST',
            token,
          }
        ),

      getSnapshots: (swingId: string) =>
        apiRequest<
          ApiResponse<{
            swingId: string;
            snapshots: {
              setup: string;
              topOfBackswing: string;
              impact: string;
              followThrough: string;
            };
            status: 'completed' | 'processing' | 'failed';
            createdAt: string;
            updatedAt: string;
          }>
        >(`/swings/${swingId}/snapshots`, { token }),

      getPresignedSnapshotUrls: (swingId: string) =>
        apiRequest<
          ApiResponse<{
            swing_id: string;
            snapshots: {
              setup: string;
              top_backswing: string;
              impact: string;
              follow_through: string;
            };
            status: 'available' | 'not_generated' | 'processing';
          }>
        >(`/swings/${swingId}/snapshots/presigned-urls`, { token }),

      testSnapshots: () =>
        apiRequest<
          ApiResponse<{
            swingId: string;
            snapshots: {
              setup: string;
              topOfBackswing: string;
              impact: string;
              followThrough: string;
            };
            status: 'completed';
          }>
        >('/swings/test-snapshots', {
          method: 'POST',
          token,
        }),
    },
  };
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const { token, ...requestOptions } = options;

  console.log(`🌐 [DEBUG] API Request:`, {
    url,
    method: requestOptions.method || 'GET',
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
    headers: requestOptions.headers,
  });

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...requestOptions.headers,
    },
    ...requestOptions,
  };

  try {
    console.log(`🌐 [DEBUG] Making fetch request to:`, url);
    const response = await fetch(url, config);

    console.log(`🌐 [DEBUG] Response received:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [DEBUG] HTTP Error Response:`, errorText);
      throw new ApiError(
        response.status,
        `HTTP error! status: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log(`🌐 [DEBUG] Response data:`, data);
    return data;
  } catch (error) {
    // Handle network errors gracefully
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      // Network error - API server might not be running
      console.warn(
        `⚠️ [API] Network error - API server may not be available at ${url}`
      );
      throw new ApiError(
        0,
        'Network error: Unable to connect to the server. Please check if the API server is running.'
      );
    }

    if (error instanceof ApiError) {
      throw error;
    }

    console.error(`❌ [DEBUG] API Request failed:`, error);
    throw new ApiError(
      0,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

// Auth API - Using Clerk for authentication
export const authApi = {
  // Get current user info from backend (optional - you might not need this)
  getCurrentUser: () => apiRequest<ApiResponse<unknown>>('/auth/me'),
};

// Swings API
export const swingsApi = {
  getLibrary: (page = 1, limit = 20) =>
    apiRequest<PaginatedResponse<Swing>>(`/swings?page=${page}&limit=${limit}`),

  getSwing: (id: string) => apiRequest<ApiResponse<Swing>>(`/swings/${id}`),

  createSwing: (swingData: Partial<Swing>) =>
    apiRequest<ApiResponse<Swing>>('/swings', {
      method: 'POST',
      body: JSON.stringify(swingData),
    }),

  updateSwing: (id: string, swingData: Partial<Swing>) =>
    apiRequest<ApiResponse<Swing>>(`/swings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(swingData),
    }),

  deleteSwing: (id: string) =>
    apiRequest<ApiResponse<null>>(`/swings/${id}`, {
      method: 'DELETE',
    }),

  getPresignedUrl: (fileName: string, fileType: string) =>
    apiRequest<ApiResponse<PresignedUrlResponse>>('/swings/upload-url', {
      method: 'POST',
      body: JSON.stringify({ fileName, fileType }),
    }),

  uploadVideo: async (
    presignedUrl: string,
    file: File,
    fields: Record<string, string>
  ) => {
    const formData = new FormData();

    // Add the fields first
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Add the file last
    formData.append('file', file);

    const response = await fetch(presignedUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new ApiError(response.status, 'Upload failed');
    }

    return response;
  },
};

// Pose Analysis API
export const poseAnalysisApi = {
  generateSnapshots: (swingId: string) =>
    apiRequest<ApiResponse<{ taskId: string; status: string }>>(
      `/swings/${swingId}/snapshots/generate`,
      {
        method: 'POST',
      }
    ),

  getSnapshots: (swingId: string) =>
    apiRequest<
      ApiResponse<{
        swing_id: string;
        snapshots: {
          setup: string;
          top_backswing: string;
          impact: string;
          follow_through: string;
        };
        status: 'available' | 'processing' | 'failed';
        createdAt?: string;
        updatedAt?: string;
      }>
    >(`/swings/${swingId}/snapshots`),

  getPresignedSnapshotUrls: (swingId: string) =>
    apiRequest<
      ApiResponse<{
        swing_id: string;
        presigned_urls: {
          setup: string;
          top_backswing: string;
          impact: string;
          follow_through: string;
        };
      }>
    >(`/swings/${swingId}/snapshots/presigned-urls`),

  testSnapshots: () =>
    apiRequest<
      ApiResponse<{
        swingId: string;
        snapshots: {
          setup: string;
          topOfBackswing: string;
          impact: string;
          followThrough: string;
        };
        status: 'completed';
      }>
    >('/swings/test-snapshots', {
      method: 'POST',
    }),
};

// Comparisons API
export const comparisonsApi = {
  getComparisons: () => apiRequest<ApiResponse<Comparison[]>>('/comparisons'),

  getComparison: (id: string) =>
    apiRequest<ApiResponse<Comparison>>(`/comparisons/${id}`),

  createComparison: (comparisonData: Partial<Comparison>) =>
    apiRequest<ApiResponse<Comparison>>('/comparisons', {
      method: 'POST',
      body: JSON.stringify(comparisonData),
    }),

  updateComparison: (id: string, comparisonData: Partial<Comparison>) =>
    apiRequest<ApiResponse<Comparison>>(`/comparisons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(comparisonData),
    }),

  deleteComparison: (id: string) =>
    apiRequest<ApiResponse<null>>(`/comparisons/${id}`, {
      method: 'DELETE',
    }),
};

export { ApiError };
