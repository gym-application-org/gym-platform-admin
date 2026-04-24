/** Matches /api/Users responses (Postman). */
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  status?: boolean;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
