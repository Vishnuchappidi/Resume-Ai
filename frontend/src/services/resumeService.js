import apiClient from './apiClient';

export const resumeService = {
  async analyzeResume(file, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/resume/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
      timeout: 120000, // 2 min for AI processing
    });
    return response.data;
  },

  async getHistory() {
    const response = await apiClient.get('/resume/history');
    return response.data;
  },

  async getAnalysisById(id) {
    const response = await apiClient.get(`/resume/${id}`);
    return response.data;
  },

  async deleteAnalysis(id) {
    const response = await apiClient.delete(`/resume/${id}`);
    return response.data;
  },
};
