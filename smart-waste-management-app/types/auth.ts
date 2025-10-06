export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
}

export interface ValidationErrors {
  username?: string;
  email?: string;
  password?: string;
}

export interface PasswordStrength {
  score: number;
  feedback: string;
}