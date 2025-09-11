import { buildApiUrl, UPLOAD_CONFIG, API_ENDPOINTS } from '../config/django';

export interface AnalysisUploadResult {
  success: boolean;
  fileId?: string;
  analysisId?: string;
  message?: string;
  error?: string;
  analysis?: DeepFaceAnalysisResult;
  advice?: string;
}

export interface DeepFaceAnalysisResult {
  depression_indicators: {
    facial_expression: number;
    body_language: number;
    eye_contact: number;
    micro_expressions: number;
    overall_score: number;
  };
  emotional_analysis: {
    dominant_emotion: string;
    emotion_confidence: number;
    emotion_distribution: Record<string, number>;
  };
  recommendations: string[];
  mood_analysis: string;
  risk_level: 'low' | 'moderate' | 'high';
  therapeutic_suggestions: string[];
  timestamp: string;
}

class AnalysisService {
  private apiKey: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = buildApiUrl(endpoint);
    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async uploadImage(file: File, metadata?: any): Promise<AnalysisUploadResult> {
    try {
      // Validate file
      if (!UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type)) {
        throw new Error('Invalid image type. Please upload JPEG, PNG, or WebP files.');
      }

      if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
        throw new Error('File too large. Maximum size is 50MB.');
      }

      const formData = new FormData();
      formData.append('image', file);
      formData.append('analysis_type', 'depression_detection');
      
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const result = await this.makeRequest(API_ENDPOINTS.ANALYSIS.UPLOAD_IMAGE, {
        method: 'POST',
        body: formData,
      });

      return {
        success: true,
        fileId: result.file_id,
        analysisId: result.analysis_id,
        analysis: result.analysis_result,
        advice: result.advice,
        message: result.message || 'Image analyzed successfully.',
      };
    } catch (error) {
      console.error('Image upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  async uploadVideo(file: File, metadata?: any): Promise<AnalysisUploadResult> {
    try {
      // Validate file
      if (!UPLOAD_CONFIG.ALLOWED_VIDEO_TYPES.includes(file.type)) {
        throw new Error('Invalid video type. Please upload MP4, WebM, or QuickTime files.');
      }

      if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
        throw new Error('File too large. Maximum size is 50MB.');
      }

      const formData = new FormData();
      formData.append('video', file);
      formData.append('analysis_type', 'depression_detection');
      
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const result = await this.makeRequest(API_ENDPOINTS.ANALYSIS.UPLOAD_VIDEO, {
        method: 'POST',
        body: formData,
      });

      return {
        success: true,
        fileId: result.file_id,
        analysisId: result.analysis_id,
        analysis: result.analysis_result,
        advice: result.advice,
        message: result.message || 'Video analyzed successfully.',
      };
    } catch (error) {
      console.error('Video upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  async uploadFileInChunks(file: File, type: 'image' | 'video'): Promise<AnalysisUploadResult> {
    try {
      const chunks = Math.ceil(file.size / UPLOAD_CONFIG.CHUNK_SIZE);
      const uploadId = crypto.randomUUID();

      for (let i = 0; i < chunks; i++) {
        const start = i * UPLOAD_CONFIG.CHUNK_SIZE;
        const end = Math.min(start + UPLOAD_CONFIG.CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('upload_id', uploadId);
        formData.append('chunk_index', i.toString());
        formData.append('total_chunks', chunks.toString());
        formData.append('filename', file.name);
        formData.append('file_type', type);

        await this.makeRequest(`${API_ENDPOINTS.ANALYSIS.UPLOAD_IMAGE}/chunk`, {
          method: 'POST',
          body: formData,
        });
      }

      // Finalize upload
      const result = await this.makeRequest(`${API_ENDPOINTS.ANALYSIS.UPLOAD_IMAGE}/finalize`, {
        method: 'POST',
        body: JSON.stringify({
          upload_id: uploadId,
          analysis_type: 'depression_detection',
        }),
      });

      return {
        success: true,
        fileId: result.file_id,
        analysisId: result.analysis_id,
        message: 'File uploaded successfully. Analysis in progress...',
      };
    } catch (error) {
      console.error('Chunked upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  async getAnalysisResults(analysisId: string): Promise<DeepFaceAnalysisResult> {
    try {
      const result = await this.makeRequest(`${API_ENDPOINTS.ANALYSIS.GET_RESULTS}/${analysisId}`);
      return result;
    } catch (error) {
      console.error('Failed to get analysis results:', error);
      throw error;
    }
  }

  async batchAnalysis(files: File[]): Promise<AnalysisUploadResult[]> {
    const results = await Promise.allSettled(
      files.map(file => {
        const isImage = UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type);
        const isVideo = UPLOAD_CONFIG.ALLOWED_VIDEO_TYPES.includes(file.type);
        
        if (isImage) {
          return this.uploadImage(file);
        } else if (isVideo) {
          return this.uploadVideo(file);
        } else {
          return Promise.resolve({
            success: false,
            error: `Unsupported file type: ${file.type}`,
          });
        }
      })
    );

    return results.map(result => 
      result.status === 'fulfilled' 
        ? result.value 
        : { success: false, error: result.reason?.message || 'Unknown error' }
    );
  }
}

export const analysisService = new AnalysisService();

export class ChatService {
  private async makeRequest(endpoint: string, body: any) {
    const url = buildApiUrl(endpoint);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  async sendIntent(text: string): Promise<string> {
    const result = await this.makeRequest(API_ENDPOINTS.CHAT.INTENT, { text });
    return result.reply as string;
  }

  async generate(text: string): Promise<string> {
    const result = await this.makeRequest(API_ENDPOINTS.CHAT.GENERATE, { text });
    return result.reply as string;
  }
}

export const chatService = new ChatService();