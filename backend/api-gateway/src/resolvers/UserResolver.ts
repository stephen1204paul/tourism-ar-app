import { Resolver, Query, Mutation, Arg } from 'type-graphql';
import { User, AuthPayload, RegisterInput, LoginInput } from '../types/User';

// Mock user data
const mockUsers: User[] = [];

@Resolver(User)
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(): Promise<User | null> {
    // Mock implementation - in production, get user from token
    return mockUsers.length > 0 ? mockUsers[0] : null;
  }

  @Mutation(() => AuthPayload)
  async register(@Arg('input') input: RegisterInput): Promise<AuthPayload> {
    // Mock implementation - in production, hash password and save to database
    const newUser: User = {
      id: String(mockUsers.length + 1),
      email: input.email,
      username: input.username,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUsers.push(newUser);

    return {
      token: 'mock-jwt-token',
      user: newUser,
    };
  }

  @Mutation(() => AuthPayload)
  async login(@Arg('input') input: LoginInput): Promise<AuthPayload> {
    // Mock implementation - in production, verify password and generate JWT
    const user = mockUsers.find((u) => u.email === input.email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    return {
      token: 'mock-jwt-token',
      user,
    };
  }
}
