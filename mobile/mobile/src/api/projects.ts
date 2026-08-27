import { apiClient } from './client';
import { CreateProjectPayload, Project } from '../types/project';

export async function fetchProjects(): Promise<Project[]> {
  const response = await apiClient.get<Project[]>('/projects');
  return response.data;
}

export async function createProjectRequest(payload: CreateProjectPayload): Promise<Project> {
  const response = await apiClient.post<Project>('/projects', payload);
  return response.data;
}
