import axiosClient from './axiosClient';

export const authApi = {
  login: (credentials) => axiosClient.post('/api/auth/login', credentials),
  getCurrentUser: () => axiosClient.get('/api/auth/me'),
};

export const dashboardApi = {
  getStats: () => axiosClient.get('/api/dashboard/stats'),
};

export const studentsApi = {
  getAll: () => axiosClient.get('/api/students'),
  getById: (id) => axiosClient.get(`/api/students/${id}`),
  create: (data) => axiosClient.post('/api/students', data),
  update: (id, data) => axiosClient.put(`/api/students/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/students/${id}`),
  getRegistrations: (id) => axiosClient.get(`/api/students/${id}/registrations`),
  addRegistration: (data) => axiosClient.post('/api/students/registrations', data),
  deleteRegistration: (id) => axiosClient.delete(`/api/students/registrations/${id}`),
};

export const coursesApi = {
  getAll: () => axiosClient.get('/api/courses'),
  getById: (id) => axiosClient.get(`/api/courses/${id}`),
  create: (data) => axiosClient.post('/api/courses', data),
  update: (id, data) => axiosClient.put(`/api/courses/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/courses/${id}`),
};

export const examinationsApi = {
  getAll: () => axiosClient.get('/api/examinations'),
  getById: (id) => axiosClient.get(`/api/examinations/${id}`),
  create: (data) => axiosClient.post('/api/examinations', data),
  update: (id, data) => axiosClient.put(`/api/examinations/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/examinations/${id}`),
};

export const timeSlotsApi = {
  getAll: (date) => axiosClient.get('/api/timeslots', { params: { date } }),
  getById: (id) => axiosClient.get(`/api/timeslots/${id}`),
  create: (data) => axiosClient.post('/api/timeslots', data),
  update: (id, data) => axiosClient.put(`/api/timeslots/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/timeslots/${id}`),
};

export const roomsApi = {
  getAll: (activeOnly) => axiosClient.get('/api/rooms', { params: { activeOnly } }),
  getById: (id) => axiosClient.get(`/api/rooms/${id}`),
  create: (data) => axiosClient.post('/api/rooms', data),
  update: (id, data) => axiosClient.put(`/api/rooms/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/rooms/${id}`),
};

export const facultyApi = {
  getAll: () => axiosClient.get('/api/faculty'),
  getById: (id) => axiosClient.get(`/api/faculty/${id}`),
  create: (data) => axiosClient.post('/api/faculty', data),
  update: (id, data) => axiosClient.put(`/api/faculty/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/faculty/${id}`),
  getUnavailabilities: () => axiosClient.get('/api/faculty/unavailability'),
  addUnavailability: (data) => axiosClient.post('/api/faculty/unavailability', data),
  deleteUnavailability: (id) => axiosClient.delete(`/api/faculty/unavailability/${id}`),
};

export const constraintsApi = {
  getAll: () => axiosClient.get('/api/constraints'),
  getById: (id) => axiosClient.get(`/api/constraints/${id}`),
  update: (id, data) => axiosClient.put(`/api/constraints/${id}`, data),
  toggle: (id) => axiosClient.patch(`/api/constraints/${id}/toggle`),
};

export const schedulesApi = {
  getAll: () => axiosClient.get('/api/schedules'),
  getById: (id) => axiosClient.get(`/api/schedules/${id}`),
  getItems: (id) => axiosClient.get(`/api/schedules/${id}/items`),
  getConflicts: (id) => axiosClient.get(`/api/schedules/${id}/conflicts`),
  getGraph: () => axiosClient.get('/api/schedules/graph'),
  generate: (params) => axiosClient.post('/api/schedules/generate', params),
  editItem: (scheduleId, itemId, data) => axiosClient.put(`/api/schedules/${scheduleId}/items/${itemId}`, data),
  revalidate: (id) => axiosClient.post(`/api/schedules/${id}/revalidate`),
  publish: (id) => axiosClient.post(`/api/schedules/${id}/publish`),
  unpublish: (id) => axiosClient.post(`/api/schedules/${id}/unpublish`),
  delete: (id) => axiosClient.delete(`/api/schedules/${id}`),
};

export const demoApi = {
  reset: () => axiosClient.post('/api/demo/reset'),
};

