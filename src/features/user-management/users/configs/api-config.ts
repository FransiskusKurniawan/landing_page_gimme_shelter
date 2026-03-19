/**
 * User Management API Configuration
 * 
 * This file contains the API endpoint configurations for user management operations.
 * All endpoints are prefixed with /user-management/users
 */

export const USER_API_ENDPOINTS = {
  // Get list of users with pagination, search, sort, and date filters
  LIST: '/user-management/users',
  
  // Get single user by ID
  GET_BY_ID: (id: number) => `/user-management/users/${id}`,
  
  // Get available roles for user creation/editing
  GET_ADD_DATA: '/user-management/users/add',
  
  // Create new user
  CREATE: '/user-management/users',
  
  // Update existing user
  UPDATE: (id: number) => `/user-management/users/${id}`,
  
  // Delete user
  DELETE: (id: number) => `/user-management/users/${id}`,
};

/**
 * Query Parameters for User List
 */
export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  search_by?: 'username' | 'name' | 'roles.name';
  sort_by?: 'id' | 'username' | 'name' | 'created_at' | 'updated_at';
  sort?: 'asc' | 'desc';
  start_date?: string; // Format: YYYY-MM-DD
  end_date?: string; // Format: YYYY-MM-DD
}

/**
 * Default Query Parameters
 */
export const DEFAULT_USER_QUERY_PARAMS: UserQueryParams = {
  page: 1,
  limit: 10,
  sort_by: 'id',
  sort: 'asc',
};
