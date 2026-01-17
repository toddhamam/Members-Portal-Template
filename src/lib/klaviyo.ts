const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
const KLAVIYO_API_URL = 'https://a.klaviyo.com/api';

if (!KLAVIYO_API_KEY) {
  console.warn('Klaviyo API key not configured');
}

const klaviyoFetch = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${KLAVIYO_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
      'revision': '2024-02-15',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Klaviyo API error: ${error}`);
  }

  return response.json();
};

// Create or update a profile
export async function upsertProfile({
  email,
  firstName,
  lastName,
  phone,
  properties,
}: {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  properties?: Record<string, unknown>;
}) {
  return klaviyoFetch('/profiles/', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'profile',
        attributes: {
          email,
          first_name: firstName,
          last_name: lastName,
          phone_number: phone,
          properties,
        },
      },
    }),
  });
}

// Add profile to a list
export async function addProfileToList(listId: string, email: string) {
  return klaviyoFetch(`/lists/${listId}/relationships/profiles/`, {
    method: 'POST',
    body: JSON.stringify({
      data: [
        {
          type: 'profile',
          id: await getProfileIdByEmail(email),
        },
      ],
    }),
  });
}

// Get profile ID by email
export async function getProfileIdByEmail(email: string): Promise<string> {
  const response = await klaviyoFetch(`/profiles/?filter=equals(email,"${email}")`);
  if (response.data.length === 0) {
    throw new Error(`Profile not found for email: ${email}`);
  }
  return response.data[0].id;
}

// Track an event (for triggering flows)
export async function trackEvent({
  email,
  eventName,
  properties,
  value,
}: {
  email: string;
  eventName: string;
  properties?: Record<string, unknown>;
  value?: number;
}) {
  return klaviyoFetch('/events/', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'event',
        attributes: {
          metric: {
            data: {
              type: 'metric',
              attributes: {
                name: eventName,
              },
            },
          },
          profile: {
            data: {
              type: 'profile',
              attributes: {
                email,
              },
            },
          },
          properties,
          value,
          time: new Date().toISOString(),
        },
      },
    }),
  });
}

// Update profile properties (for tagging)
export async function updateProfileProperties(
  email: string,
  properties: Record<string, unknown>
) {
  const profileId = await getProfileIdByEmail(email);

  return klaviyoFetch(`/profiles/${profileId}/`, {
    method: 'PATCH',
    body: JSON.stringify({
      data: {
        type: 'profile',
        id: profileId,
        attributes: {
          properties,
        },
      },
    }),
  });
}

// Predefined events for your funnel
export const FunnelEvents = {
  ORDER_COMPLETED: 'Order Completed',
  UPSELL_1_ACCEPTED: 'Upsell 1 Accepted',
  UPSELL_1_DECLINED: 'Upsell 1 Declined',
  DOWNSELL_1_ACCEPTED: 'Downsell 1 Accepted',
  DOWNSELL_1_DECLINED: 'Downsell 1 Declined',
  UPSELL_2_ACCEPTED: 'Upsell 2 Accepted',
  UPSELL_2_DECLINED: 'Upsell 2 Declined',
} as const;

// Predefined lists for your funnel (you'll set these IDs in env vars)
export const FunnelLists = {
  CUSTOMERS: process.env.KLAVIYO_CUSTOMERS_LIST_ID,
  RESISTANCE_MAP_BUYERS: process.env.KLAVIYO_RESISTANCE_MAP_LIST_ID,
  PATHLESS_PATH_BUYERS: process.env.KLAVIYO_PATHLESS_PATH_LIST_ID,
} as const;
