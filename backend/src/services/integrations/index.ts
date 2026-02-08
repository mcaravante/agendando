import { PrismaClient, IntegrationProvider, Integration } from '@prisma/client';

const prisma = new PrismaClient();

export * from './google.service';
export * from './zoom.service';

type IntegrationSummary = Pick<Integration, 'id' | 'provider' | 'accountEmail' | 'isActive' | 'createdAt'>;

export async function getUserIntegrations(userId: string) {
  const integrations: IntegrationSummary[] = await prisma.integration.findMany({
    where: { userId },
    select: {
      id: true,
      provider: true,
      accountEmail: true,
      isActive: true,
      createdAt: true,
    },
  });

  // Return status for all providers
  const providers = Object.values(IntegrationProvider);

  return providers.map((provider) => {
    const integration = integrations.find((i: IntegrationSummary) => i.provider === provider);
    return {
      provider,
      connected: !!integration?.isActive,
      accountEmail: integration?.accountEmail || null,
      connectedAt: integration?.createdAt || null,
    };
  });
}

export async function hasIntegration(
  userId: string,
  provider: IntegrationProvider
): Promise<boolean> {
  const integration = await prisma.integration.findUnique({
    where: {
      userId_provider: { userId, provider },
    },
  });

  return !!integration?.isActive;
}
