import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
});

// malware
export const getMalware = id => api.get(`/malware/${id}`);
export const listMalware = id => api.get(`/malware`);
export const createMalware = payload => api.post(`/malware`, payload);
export const updateMalware = (id, payload) => api.put(`/malware/${id}`, payload);
export const deleteMalware = id => api.delete(`/malware/${id}`);

// incident
export const addIncident = (id, payload) =>
  api.post(`/malware/${id}/incidents`, payload);

export const deleteIncident = id =>
  api.delete(`/incidents/${id}`);