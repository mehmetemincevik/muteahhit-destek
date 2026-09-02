import { apiClient } from './client';
import {
  CreateLandOwnerPayload,
  CreateProjectPayload,
  LandOwner,
  Project,
  UpdateProjectPayload,
} from '../types/project';

export async function fetchProjects(): Promise<Project[]> {
  const response = await apiClient.get<Project[]>('/projects');
  return response.data;
}

export async function createProjectRequest(payload: CreateProjectPayload): Promise<Project> {
  const response = await apiClient.post<Project>('/projects', payload);
  return response.data;
}

export async function updateProjectRequest(
  projectId: string,
  payload: UpdateProjectPayload,
): Promise<Project> {
  const response = await apiClient.patch<Project>(`/projects/${projectId}`, payload);
  return response.data;
}

export async function fetchLandOwners(projectId: string): Promise<LandOwner[]> {
  const response = await apiClient.get<LandOwner[]>(`/projects/${projectId}/land-owners`);
  return response.data;
}

export async function addLandOwnerRequest(
  projectId: string,
  payload: CreateLandOwnerPayload,
): Promise<LandOwner> {
  const response = await apiClient.post<LandOwner>(`/projects/${projectId}/land-owners`, payload);
  return response.data;
}
