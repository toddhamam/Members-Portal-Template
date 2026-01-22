// Meta Conversions API (CAPI) for server-side event tracking
// Bypasses iOS ATT opt-outs by sending events directly to Meta

import crypto from 'crypto';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CONVERSIONS_API_TOKEN;
const API_VERSION = 'v18.0';
const GRAPH_API_URL = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;

// Hash user data for privacy (required by Meta)
function hashData(data: string): string {
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

// User data interface
interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string; // Facebook click ID from cookie
  fbp?: string; // Facebook browser ID from cookie
  externalId?: string; // Your user ID
}

// Event data interface
interface EventData {
  eventName: string;
  eventTime?: number; // Unix timestamp
  eventId?: string; // For deduplication with client-side
  eventSourceUrl?: string;
  actionSource?: 'website' | 'email' | 'app' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other';
  userData: UserData;
  customData?: {
    value?: number;
    currency?: string;
    contentIds?: string[];
    contentName?: string;
    contentCategory?: string;
    contentType?: string;
    numItems?: number;
    orderId?: string;
  };
}

// Format user data with hashing
function formatUserData(userData: UserData): Record<string, string | undefined> {
  const formatted: Record<string, string | undefined> = {};

  if (userData.email) {
    formatted.em = hashData(userData.email);
  }
  if (userData.phone) {
    // Remove all non-numeric characters before hashing
    formatted.ph = hashData(userData.phone.replace(/\D/g, ''));
  }
  if (userData.firstName) {
    formatted.fn = hashData(userData.firstName);
  }
  if (userData.lastName) {
    formatted.ln = hashData(userData.lastName);
  }
  if (userData.city) {
    formatted.ct = hashData(userData.city);
  }
  if (userData.state) {
    formatted.st = hashData(userData.state);
  }
  if (userData.country) {
    formatted.country = hashData(userData.country);
  }
  if (userData.zipCode) {
    formatted.zp = hashData(userData.zipCode);
  }
  if (userData.externalId) {
    formatted.external_id = hashData(userData.externalId);
  }

  // These are not hashed
  if (userData.clientIpAddress) {
    formatted.client_ip_address = userData.clientIpAddress;
  }
  if (userData.clientUserAgent) {
    formatted.client_user_agent = userData.clientUserAgent;
  }
  if (userData.fbc) {
    formatted.fbc = userData.fbc;
  }
  if (userData.fbp) {
    formatted.fbp = userData.fbp;
  }

  return formatted;
}

// Format custom data
function formatCustomData(customData?: EventData['customData']): Record<string, unknown> | undefined {
  if (!customData) return undefined;

  const formatted: Record<string, unknown> = {};

  if (customData.value !== undefined) {
    formatted.value = customData.value;
  }
  if (customData.currency) {
    formatted.currency = customData.currency;
  }
  if (customData.contentIds) {
    formatted.content_ids = customData.contentIds;
  }
  if (customData.contentName) {
    formatted.content_name = customData.contentName;
  }
  if (customData.contentCategory) {
    formatted.content_category = customData.contentCategory;
  }
  if (customData.contentType) {
    formatted.content_type = customData.contentType;
  }
  if (customData.numItems !== undefined) {
    formatted.num_items = customData.numItems;
  }
  if (customData.orderId) {
    formatted.order_id = customData.orderId;
  }

  return Object.keys(formatted).length > 0 ? formatted : undefined;
}

// Send event to Meta Conversions API
export async function sendEvent(eventData: EventData): Promise<{ success: boolean; error?: string }> {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn('Meta CAPI: Missing PIXEL_ID or ACCESS_TOKEN');
    return { success: false, error: 'Missing configuration' };
  }

  const event = {
    event_name: eventData.eventName,
    event_time: eventData.eventTime || Math.floor(Date.now() / 1000),
    event_id: eventData.eventId,
    event_source_url: eventData.eventSourceUrl,
    action_source: eventData.actionSource || 'website',
    user_data: formatUserData(eventData.userData),
    custom_data: formatCustomData(eventData.customData),
  };

  const payload = {
    data: [event],
    access_token: ACCESS_TOKEN,
  };

  try {
    const response = await fetch(GRAPH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Meta CAPI error:', result);
      return { success: false, error: result.error?.message || 'API error' };
    }

    console.log('Meta CAPI success:', eventData.eventName, result);
    return { success: true };
  } catch (error) {
    console.error('Meta CAPI fetch error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

// Convenience function for Purchase events
export async function trackServerPurchase(params: {
  email: string;
  value: number;
  currency?: string;
  orderId?: string;
  contentIds?: string[];
  contentName?: string;
  numItems?: number;
  eventId?: string;
  eventSourceUrl?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  firstName?: string;
  lastName?: string;
  fbc?: string;
  fbp?: string;
}): Promise<{ success: boolean; error?: string }> {
  return sendEvent({
    eventName: 'Purchase',
    eventId: params.eventId,
    eventSourceUrl: params.eventSourceUrl,
    userData: {
      email: params.email,
      firstName: params.firstName,
      lastName: params.lastName,
      clientIpAddress: params.clientIpAddress,
      clientUserAgent: params.clientUserAgent,
      fbc: params.fbc,
      fbp: params.fbp,
    },
    customData: {
      value: params.value,
      currency: params.currency || 'USD',
      orderId: params.orderId,
      contentIds: params.contentIds,
      contentName: params.contentName,
      numItems: params.numItems,
    },
  });
}

// Convenience function for InitiateCheckout events
export async function trackServerInitiateCheckout(params: {
  email?: string;
  value?: number;
  currency?: string;
  contentIds?: string[];
  numItems?: number;
  eventId?: string;
  eventSourceUrl?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
}): Promise<{ success: boolean; error?: string }> {
  return sendEvent({
    eventName: 'InitiateCheckout',
    eventId: params.eventId,
    eventSourceUrl: params.eventSourceUrl,
    userData: {
      email: params.email,
      clientIpAddress: params.clientIpAddress,
      clientUserAgent: params.clientUserAgent,
    },
    customData: {
      value: params.value,
      currency: params.currency || 'USD',
      contentIds: params.contentIds,
      numItems: params.numItems,
    },
  });
}

// Convenience function for Lead events
export async function trackServerLead(params: {
  email: string;
  firstName?: string;
  lastName?: string;
  contentName?: string;
  value?: number;
  eventId?: string;
  eventSourceUrl?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
}): Promise<{ success: boolean; error?: string }> {
  return sendEvent({
    eventName: 'Lead',
    eventId: params.eventId,
    eventSourceUrl: params.eventSourceUrl,
    userData: {
      email: params.email,
      firstName: params.firstName,
      lastName: params.lastName,
      clientIpAddress: params.clientIpAddress,
      clientUserAgent: params.clientUserAgent,
    },
    customData: {
      contentName: params.contentName,
      value: params.value,
      currency: 'USD',
    },
  });
}
