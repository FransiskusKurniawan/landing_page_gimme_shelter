export interface UpdateProfileRequest {
  name?: string;
  photo_profile?: File;
}

export interface UpdateProfileResponse {
  data: {
    user: {
      id: number;
      username: string;
      name: string;
      photo_profile: string;
      roles: Array<{
        id: number;
        name: string;
        description: string;
        created_at: string;
        updated_at: string;
      }>;
      created_at: string;
      updated_at: string;
    };
  };
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  message: string;
}

