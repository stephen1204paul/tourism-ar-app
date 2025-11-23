import { apolloClient } from './apolloClient';
import { LOGIN_USER, REGISTER_USER } from './queries';
import { AuthResponse, RegisterInput, ApiResponse } from './types';

const TOKEN_KEY = 'auth_token';

export async function login(
  email: string,
  password: string
): Promise<ApiResponse<AuthResponse>> {
  try {
    const { data } = await apolloClient.mutate({
      mutation: LOGIN_USER,
      variables: {
        input: { email, password },
      },
    });

    const authResponse = data.login as AuthResponse;
    localStorage.setItem(TOKEN_KEY, authResponse.token);

    return { data: authResponse, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Login failed',
    };
  }
}

export async function register(
  input: RegisterInput
): Promise<ApiResponse<AuthResponse>> {
  try {
    const { data } = await apolloClient.mutate({
      mutation: REGISTER_USER,
      variables: { input },
    });

    const authResponse = data.register as AuthResponse;
    localStorage.setItem(TOKEN_KEY, authResponse.token);

    return { data: authResponse, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Registration failed',
    };
  }
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  apolloClient.clearStore();
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
