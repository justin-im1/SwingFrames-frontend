import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedApi } from './useAuthenticatedApi';
import { Swing, PoseAnalysis, RootState } from '../types';

// Query keys
export const swingKeys = {
  all: ['swings'] as const,
  library: () => [...swingKeys.all, 'library'] as const,
  swing: (id: string) => [...swingKeys.all, id] as const,
  poseAnalysis: (id: string) =>
    [...swingKeys.all, 'pose-analysis', id] as const,
};

// Hooks
export const useSwingsLibrary = (page = 1, limit = 20) => {
  const api = useAuthenticatedApi();

  return useQuery({
    queryKey: [...swingKeys.library(), page, limit],
    queryFn: async () => {
      const swingsApi = await api.swings();
      return swingsApi.getLibrary(page, limit);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useSwing = (id: string) => {
  const api = useAuthenticatedApi();

  return useQuery({
    queryKey: swingKeys.swing(id),
    queryFn: async () => {
      const swingsApi = await api.swings();
      return swingsApi.getSwing(id);
    },
    enabled: !!id,
  });
};

export const useCreateSwing = () => {
  const queryClient = useQueryClient();
  const api = useAuthenticatedApi();

  return useMutation({
    mutationFn: async ({
      fileUrl,
      tag,
      title,
      description,
    }: {
      fileUrl: string;
      tag?: string;
      title?: string;
      description?: string;
    }) => {
      const swingsApi = await api.swings();

      console.log('🏌️ Creating swing record with data:', {
        fileUrl,
        tag,
        title,
        description,
      });

      // Create swing data object - using string for tag to match backend expectation
      const swingData = {
        file_url: fileUrl,
        tag: tag || 'practice_swing', // Backend expects string, not SwingTag object
        title: title || `Golf Swing - ${new Date().toLocaleDateString()}`,
        description: description || '',
      };

      console.log('📤 Sending swing data to backend:', swingData);

      const response = await swingsApi.createSwing(
        swingData as unknown as Partial<Swing>
      );
      console.log('✅ Swing created successfully:', response);

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: swingKeys.library() });
    },
  });
};

export const useUpdateSwing = () => {
  const queryClient = useQueryClient();
  const api = useAuthenticatedApi();

  return useMutation({
    mutationFn: async ({
      id,
      swingData,
    }: {
      id: string;
      swingData: Partial<Swing>;
    }) => {
      const swingsApi = await api.swings();
      return swingsApi.updateSwing(id, swingData);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: swingKeys.library() });
      queryClient.invalidateQueries({
        queryKey: swingKeys.swing(variables.id),
      });
    },
  });
};

export const useDeleteSwing = () => {
  const queryClient = useQueryClient();
  const api = useAuthenticatedApi();

  return useMutation({
    mutationFn: async (id: string) => {
      const swingsApi = await api.swings();
      return swingsApi.deleteSwing(id);
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: swingKeys.library() });
      queryClient.removeQueries({ queryKey: swingKeys.swing(id) });
    },
  });
};

export const useUploadVideo = () => {
  const queryClient = useQueryClient();
  const api = useAuthenticatedApi();

  return useMutation({
    mutationFn: async ({
      file,
      fileName,
      fileType,
    }: {
      file: File;
      fileName: string;
      fileType: string;
    }) => {
      const swingsApi = await api.swings();

      // Get presigned URL
      const presignedResponse = await swingsApi.getPresignedUrl(
        fileName,
        fileType
      );
      console.log('Presigned response:', presignedResponse);

      // Check if response exists
      if (!presignedResponse) {
        throw new Error('No response from presigned URL endpoint');
      }

      // Handle both direct response and nested data response
      const responseData = presignedResponse.data || presignedResponse;
      console.log(
        '📋 Full backend response:',
        JSON.stringify(responseData, null, 2)
      );
      console.log('📋 Response type:', typeof responseData);
      console.log('📋 Response is array:', Array.isArray(responseData));

      // Check if responseData is valid
      if (!responseData || typeof responseData !== 'object') {
        throw new Error('Invalid response data from presigned URL endpoint');
      }

      console.log(
        '🔍 Available fields in response:',
        Object.keys(responseData)
      );
      console.log('🔍 Response values:', Object.values(responseData));

      const {
        uploadUrl,
        fileUrl,
        uploadFields,
        contentType,
        contentDisposition,
      } = responseData;

      console.log('📥 Backend response data:', {
        uploadUrl: uploadUrl?.substring(0, 100) + '...',
        fileUrl,
        uploadFields,
        contentType,
        contentDisposition,
        allFields: Object.keys(responseData),
      });

      // Check if required fields exist
      if (!uploadUrl) {
        throw new Error('Missing uploadUrl in presigned URL response');
      }

      // Use uploadFields if available, otherwise fall back to constructing from individual fields
      let fieldsToUse: Record<string, string>;

      if (uploadFields && typeof uploadFields === 'object') {
        fieldsToUse = uploadFields;
        console.log('✅ Using uploadFields from backend:', fieldsToUse);
      } else if (contentType) {
        // Fallback: construct fields from individual parameters
        fieldsToUse = {
          'Content-Type': contentType,
        };

        if (contentDisposition) {
          fieldsToUse['Content-Disposition'] = contentDisposition;
        }

        console.log(
          '⚠️ Backend using old format, constructed fields:',
          fieldsToUse
        );
      } else {
        throw new Error(
          'Missing or invalid fields in presigned URL response. Expected either "uploadFields" object or "contentType" parameter.'
        );
      }

      // Upload file with FormData using the fields from backend
      await swingsApi.uploadVideo(uploadUrl, file, fieldsToUse);

      // Return the fileUrl from backend response
      return {
        fileId: fileUrl || uploadUrl, // Use fileUrl from backend, fallback to uploadUrl
        fileUrl: fileUrl || uploadUrl, // Use fileUrl from backend, fallback to uploadUrl
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: swingKeys.library() });
    },
  });
};

// Combined hook for uploading video and creating swing record
export const useUploadVideoAndCreateSwing = () => {
  const queryClient = useQueryClient();
  const uploadVideoMutation = useUploadVideo();
  const createSwingMutation = useCreateSwing();

  return useMutation({
    mutationFn: async ({
      file,
      fileName,
      fileType,
      tag,
      title,
      description,
    }: {
      file: File;
      fileName: string;
      fileType: string;
      tag?: string;
      title?: string;
      description?: string;
    }) => {
      console.log('🚀 Starting combined upload and swing creation process');

      // Step 1: Upload video to S3
      console.log('📤 Step 1: Uploading video to S3...');
      const uploadResult = await uploadVideoMutation.mutateAsync({
        file,
        fileName,
        fileType,
      });

      console.log('✅ Step 1 complete: Video uploaded to S3');
      console.log('📁 File URL:', uploadResult.fileUrl);

      // Step 2: Create swing record in database
      console.log('📝 Step 2: Creating swing record in database...');
      const swingResult = await createSwingMutation.mutateAsync({
        fileUrl: uploadResult.fileUrl,
        tag,
        title,
        description,
      });

      console.log('✅ Step 2 complete: Swing record created');
      console.log('🏌️ Swing created:', swingResult);

      return {
        ...uploadResult,
        swing: swingResult,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: swingKeys.library() });
    },
  });
};

// Pose Analysis Hooks
export const usePoseAnalysis = (swingId: string) => {
  const api = useAuthenticatedApi();
  return useQuery({
    queryKey: swingKeys.poseAnalysis(swingId),
    queryFn: async () => {
      console.log(
        `🔍 [DEBUG] Starting pose analysis fetch for swing ${swingId}`
      );
      console.log(
        `🔍 [DEBUG] Swing ID type:`,
        typeof swingId,
        'Value:',
        swingId
      );

      try {
        const poseApi = await api.poseAnalysis();
        console.log(
          `🔍 [DEBUG] Pose API created successfully for swing ${swingId}`
        );

        // Try to get presigned URLs directly (this is the main endpoint)
        try {
          console.log(
            `🔗 [DEBUG] Attempting to get presigned URLs for swing ${swingId}`
          );
          console.log(
            `🔗 [DEBUG] API endpoint: /swings/${swingId}/snapshots/presigned-urls`
          );

          const presignedResponse =
            await poseApi.getPresignedSnapshotUrls(swingId);
          console.log(
            `🔗 [DEBUG] Presigned URLs response for swing ${swingId}:`,
            presignedResponse
          );
          console.log(`🔗 [DEBUG] Response type:`, typeof presignedResponse);
          console.log(
            `🔗 [DEBUG] Response keys:`,
            Object.keys(presignedResponse || {})
          );

          const presignedData = presignedResponse.data || presignedResponse;
          console.log(
            `🔗 [DEBUG] Final presigned data for swing ${swingId}:`,
            presignedData
          );

          // Handle the backend response format
          if (presignedData.status === 'not_generated') {
            console.log(
              `📝 [DEBUG] Snapshots not generated yet for swing ${swingId}`
            );
            return presignedData;
          } else if (
            presignedData.status === 'available' &&
            presignedData.snapshots
          ) {
            console.log(`✅ [DEBUG] Snapshots available for swing ${swingId}`);
            return presignedData;
          } else if (presignedData.status === 'processing') {
            console.log(`⏳ [DEBUG] Snapshots processing for swing ${swingId}`);
            return presignedData;
          }

          return presignedData;
        } catch (presignedError) {
          console.error(
            `❌ [DEBUG] Presigned URLs failed for swing ${swingId}:`,
            presignedError
          );
          console.error(`❌ [DEBUG] Error details:`, {
            message: (presignedError as Error)?.message,
            status: (presignedError as { status?: number })?.status,
            response: (presignedError as { response?: unknown })?.response,
          });

          // Fallback to metadata endpoint if presigned URLs fail
          console.log(
            `📊 [DEBUG] Falling back to metadata endpoint for swing ${swingId}`
          );
          const snapshotResponse = await poseApi.getSnapshots(swingId);
          console.log(
            `📊 [DEBUG] Metadata response for swing ${swingId}:`,
            snapshotResponse
          );

          const snapshotData = snapshotResponse.data || snapshotResponse;
          console.log(
            `📊 [DEBUG] Final metadata for swing ${swingId}:`,
            snapshotData
          );

          return snapshotData;
        }
      } catch (apiError: unknown) {
        console.error(
          `❌ [DEBUG] API creation failed for swing ${swingId}:`,
          apiError
        );
        throw apiError;
      }
    },
    enabled: !!swingId,
    refetchInterval: query => {
      // Poll every 3 seconds if still processing (as per backend guide)
      const data = query.state.data;
      return data?.status === 'processing' ? 3000 : false;
    },
    refetchIntervalInBackground: true,
  });
};

export const useGeneratePoseAnalysis = () => {
  const queryClient = useQueryClient();
  const api = useAuthenticatedApi();

  return useMutation({
    mutationFn: async (swingId: string) => {
      console.log(
        `🚀 [DEBUG] Starting pose analysis generation for swing ${swingId}`
      );
      console.log(
        `🚀 [DEBUG] Swing ID type:`,
        typeof swingId,
        'Value:',
        swingId
      );

      try {
        const poseApi = await api.poseAnalysis();
        console.log(`🔗 [DEBUG] Pose API created for swing ${swingId}`);

        console.log(
          `🔗 [DEBUG] Calling generateSnapshots endpoint: /swings/${swingId}/snapshots/generate`
        );
        const response = await poseApi.generateSnapshots(swingId);
        console.log(
          `✅ [DEBUG] Generate response for swing ${swingId}:`,
          response
        );
        console.log(`✅ [DEBUG] Response type:`, typeof response);
        console.log(`✅ [DEBUG] Response keys:`, Object.keys(response || {}));

        return response;
      } catch (error: unknown) {
        console.error(
          `❌ [DEBUG] Error in generateSnapshots for swing ${swingId}:`,
          error
        );
        console.error(`❌ [DEBUG] Error details:`, {
          message: (error as Error)?.message,
          status: (error as { status?: number })?.status,
          response: (error as { response?: unknown })?.response,
          stack: (error as Error)?.stack,
        });
        throw error;
      }
    },
    onSuccess: (data, swingId) => {
      // Invalidate the pose analysis query to start polling
      queryClient.invalidateQueries({
        queryKey: swingKeys.poseAnalysis(swingId),
      });
    },
  });
};

export const useTestPoseAnalysis = () => {
  const queryClient = useQueryClient();
  const api = useAuthenticatedApi();

  return useMutation({
    mutationFn: async () => {
      const poseApi = await api.poseAnalysis();
      return poseApi.testSnapshots();
    },
    onSuccess: () => {
      // Invalidate all pose analysis queries
      queryClient.invalidateQueries({ queryKey: ['swings', 'pose-analysis'] });
    },
  });
};
