import axiosInstance from './axiosInstance';

export const dashboardApi = {
  stats: () => axiosInstance.get('/dashboard/stats'),
  projectProgress: () => axiosInstance.get('/dashboard/project-progress'),
  projectsOverview: (limit = 10) => axiosInstance.get('/dashboard/projects-overview', { params: { limit } }),
  dailyFeed: (limit = 8) => axiosInstance.get('/dashboard/daily-feed', { params: { limit } }),
  recentReports: (limit = 5) => axiosInstance.get('/dashboard/recent-reports', { params: { limit } }),
  recentActivity: (limit = 10) => axiosInstance.get('/dashboard/recent-activity', { params: { limit } }),
};
