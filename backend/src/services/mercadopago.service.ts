import { PrismaClient, IntegrationProvider } from '@prisma/client';
import { MercadoPagoConfig, OAuth, Preference, Payment, User } from 'mercadopago';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

function getMpEnv() {
  const clientId = process.env.MP_CLIENT_ID;
  const clientSecret = process.env.MP_CLIENT_SECRET;
  const redirectUri = process.env.MP_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new AppError('MercadoPago OAuth not configured', 500);
  }

  return { clientId, clientSecret, redirectUri };
}

function createMpClient(accessToken: string): MercadoPagoConfig {
  return new MercadoPagoConfig({ accessToken });
}

export function getMpAuthUrl(userId: string): string {
  const { clientId, clientSecret, redirectUri } = getMpEnv();

  const client = createMpClient(clientSecret);
  const oauth = new OAuth(client);

  return oauth.getAuthorizationURL({
    options: {
      client_id: clientId,
      redirect_uri: redirectUri,
      state: userId,
    },
  });
}

export async function exchangeCodeForToken(code: string, userId: string) {
  const { clientId, clientSecret, redirectUri } = getMpEnv();

  const client = createMpClient(clientSecret);
  const oauth = new OAuth(client);

  const tokens = await oauth.create({
    body: {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    },
  });

  if (!tokens.access_token || !tokens.refresh_token || !tokens.expires_in) {
    throw new AppError('Failed to get access token from MercadoPago', 400);
  }

  // Get user info to store account email
  let accountEmail: string | null = null;
  try {
    const userClient = createMpClient(tokens.access_token);
    const userApi = new User(userClient);
    const userData = await userApi.get();
    accountEmail = (userData as any).email || null;
  } catch (error) {
    console.error('Failed to get MP user info:', error);
  }

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

  const integration = await prisma.integration.upsert({
    where: {
      userId_provider: {
        userId,
        provider: IntegrationProvider.MERCADOPAGO,
      },
    },
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
      accountEmail,
      isActive: true,
    },
    create: {
      userId,
      provider: IntegrationProvider.MERCADOPAGO,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
      accountEmail,
    },
  });

  return integration;
}

export async function getMpAccessToken(userId: string): Promise<string> {
  const integration = await prisma.integration.findUnique({
    where: {
      userId_provider: {
        userId,
        provider: IntegrationProvider.MERCADOPAGO,
      },
    },
  });

  if (!integration || !integration.isActive) {
    throw new AppError('MercadoPago not connected', 400);
  }

  // Check if token needs refresh
  if (integration.expiresAt && new Date() >= integration.expiresAt) {
    if (!integration.refreshToken) {
      throw new AppError('MercadoPago token expired and no refresh token available', 400);
    }

    const { clientId, clientSecret } = getMpEnv();

    const client = createMpClient(clientSecret);
    const oauth = new OAuth(client);

    const tokens = await oauth.refresh({
      body: {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: integration.refreshToken,
      },
    });

    if (!tokens.access_token || !tokens.expires_in) {
      throw new AppError('Failed to refresh MercadoPago token', 400);
    }

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || integration.refreshToken,
        expiresAt,
      },
    });

    return tokens.access_token;
  }

  return integration.accessToken;
}

interface CreatePreferenceInput {
  bookingId: string;
  title: string;
  price: number;
  currency: string;
  accessToken: string;
  payerEmail: string;
}

export async function createPreference(input: CreatePreferenceInput) {
  const { bookingId, title, price, currency, accessToken, payerEmail } = input;

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

  const expirationDate = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes

  const client = createMpClient(accessToken);
  const preferenceApi = new Preference(client);

  const preference = await preferenceApi.create({
    body: {
      items: [
        {
          id: bookingId,
          title,
          quantity: 1,
          unit_price: price,
          currency_id: currency,
        },
      ],
      payer: {
        email: payerEmail,
      },
      external_reference: bookingId,
      back_urls: {
        success: `${frontendUrl}/booking/payment-result?status=success`,
        failure: `${frontendUrl}/booking/payment-result?status=failure`,
        pending: `${frontendUrl}/booking/payment-result?status=pending`,
      },
      auto_return: 'approved',
      notification_url: `${backendUrl}/api/webhooks/mercadopago`,
      expiration_date_to: expirationDate.toISOString(),
    },
  });

  if (!preference.id || !preference.init_point) {
    throw new AppError('Failed to create MercadoPago preference', 500);
  }

  return {
    preferenceId: preference.id,
    initPoint: preference.init_point,
  };
}

export async function getPaymentInfo(paymentId: string, accessToken: string) {
  const client = createMpClient(accessToken);
  const paymentApi = new Payment(client);

  const payment = await paymentApi.get({ id: Number(paymentId) });

  return {
    id: payment.id!,
    status: payment.status!,
    external_reference: payment.external_reference!,
    transaction_amount: payment.transaction_amount!,
    currency_id: payment.currency_id!,
  };
}

export async function disconnectMercadoPago(userId: string) {
  const integration = await prisma.integration.findUnique({
    where: {
      userId_provider: {
        userId,
        provider: IntegrationProvider.MERCADOPAGO,
      },
    },
  });

  if (!integration) {
    throw new AppError('MercadoPago not connected', 404);
  }

  await prisma.integration.delete({
    where: { id: integration.id },
  });

  return true;
}
