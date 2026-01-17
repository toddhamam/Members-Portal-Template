const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ACCESS_TOKEN) {
  console.warn('Shopify credentials not configured');
}

const shopifyFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN!,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.statusText}`);
  }

  return response.json();
};

// Create an order in Shopify
export async function createShopifyOrder({
  email,
  firstName,
  lastName,
  lineItems,
  totalPrice,
  currency = 'AUD',
  financialStatus = 'paid',
  tags,
  note,
}: {
  email: string;
  firstName: string;
  lastName: string;
  lineItems: Array<{
    title: string;
    quantity: number;
    price: string;
  }>;
  totalPrice: string;
  currency?: string;
  financialStatus?: 'paid' | 'pending' | 'refunded';
  tags?: string[];
  note?: string;
}) {
  const order = {
    order: {
      email,
      financial_status: financialStatus,
      currency,
      line_items: lineItems.map(item => ({
        title: item.title,
        quantity: item.quantity,
        price: item.price,
      })),
      customer: {
        first_name: firstName,
        last_name: lastName,
        email,
      },
      tags: tags?.join(', '),
      note,
    },
  };

  return shopifyFetch('orders.json', {
    method: 'POST',
    body: JSON.stringify(order),
  });
}

// Add tags to a customer
export async function addCustomerTags(customerId: string, tags: string[]) {
  const customer = await shopifyFetch(`customers/${customerId}.json`);
  const existingTags = customer.customer.tags ? customer.customer.tags.split(', ') : [];
  const allTags = [...new Set([...existingTags, ...tags])];

  return shopifyFetch(`customers/${customerId}.json`, {
    method: 'PUT',
    body: JSON.stringify({
      customer: {
        id: customerId,
        tags: allTags.join(', '),
      },
    }),
  });
}

// Find or create customer
export async function findOrCreateCustomer({
  email,
  firstName,
  lastName,
  tags,
}: {
  email: string;
  firstName: string;
  lastName: string;
  tags?: string[];
}) {
  // Search for existing customer
  const searchResult = await shopifyFetch(`customers/search.json?query=email:${email}`);

  if (searchResult.customers.length > 0) {
    const customer = searchResult.customers[0];
    if (tags?.length) {
      await addCustomerTags(customer.id, tags);
    }
    return customer;
  }

  // Create new customer
  const newCustomer = await shopifyFetch('customers.json', {
    method: 'POST',
    body: JSON.stringify({
      customer: {
        email,
        first_name: firstName,
        last_name: lastName,
        tags: tags?.join(', '),
      },
    }),
  });

  return newCustomer.customer;
}
