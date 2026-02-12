import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

const ALLOWED_EMAILS = [
  'matias.caravante@gmail.com',
  'micaela.hock@gmail.com',
];

export async function registerUser(input: RegisterInput) {
  const { email, username, password, name } = input;

  // Restrict registration to allowed emails
  if (!ALLOWED_EMAILS.includes(email.toLowerCase())) {
    throw new AppError('Registration is currently restricted', 403);
  }

  // Check if email already exists
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    throw new AppError('Email already registered', 400);
  }

  // Check if username already exists
  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) {
    throw new AppError('Username already taken', 400);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      name,
    },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      timezone: true,
      createdAt: true,
    },
  });

  // Create default availability (Mon-Fri 9:00-17:00)
  const defaultAvailability = [1, 2, 3, 4, 5].map((day) => ({
    userId: user.id,
    dayOfWeek: day,
    startTime: '09:00',
    endTime: '17:00',
  }));

  await prisma.availability.createMany({
    data: defaultAvailability,
  });

  // Create default scheduling config
  await prisma.schedulingConfig.create({
    data: {
      userId: user.id,
    },
  });

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    username: user.username,
  });

  return { user, token };
}

export async function loginUser(input: LoginInput) {
  const { email, password } = input;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      passwordHash: true,
      timezone: true,
      avatarUrl: true,
    },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    username: user.username,
  });

  // Remove passwordHash from response
  const { passwordHash: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      timezone: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}
