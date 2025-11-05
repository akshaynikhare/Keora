import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function createOTPCode(
  type: string,
  options: {
    userId?: string;
    mobile?: string;
    email?: string;
  }
): Promise<string> {
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.oTPCode.create({
    data: {
      code,
      type,
      expiresAt,
      ...options,
    },
  });

  return code;
}

export async function verifyOTPCode(
  code: string,
  type: string,
  identifier: { mobile?: string; email?: string; userId?: string }
): Promise<boolean> {
  const otpRecord = await prisma.oTPCode.findFirst({
    where: {
      code,
      type,
      used: false,
      expiresAt: {
        gt: new Date(),
      },
      ...(identifier.mobile && { mobile: identifier.mobile }),
      ...(identifier.email && { email: identifier.email }),
      ...(identifier.userId && { userId: identifier.userId }),
    },
  });

  if (!otpRecord) {
    return false;
  }

  // Mark as used
  await prisma.oTPCode.update({
    where: { id: otpRecord.id },
    data: { used: true },
  });

  return true;
}

export async function cleanupExpiredOTPs(): Promise<void> {
  await prisma.oTPCode.deleteMany({
    where: {
      OR: [
        { used: true },
        { expiresAt: { lt: new Date() } },
      ],
    },
  });
}
