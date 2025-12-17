// Shopify Storefront API Client
// ONE-WAY IMPORT ONLY - Products are fetched from Shopify but orders stay local

const SHOPIFY_DOMAIN = '5m5zyn-kb.myshopify.com';
const STOREFRONT_ACCESS_TOKEN = '46f2270efd1603329aa7d2593eac38a9';
const STOREFRONT_API_VERSION = '2024-01';

const STOREFRONT_URL = `https://${SHOPIFY_DOMAIN}/api/${STOREFRONT_API_VERSION}/graphql.json`;

// GraphQL query to fetch all products with full details
const GET_ALL_PRODUCTS_QUERY = `
  query GetAllProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          handle
          title
          description
          descriptionHtml
          productType
          vendor
          tags
          createdAt
          updatedAt
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 10) {
            edges {
              node {
                id
                url
                altText
                width
                height
              }
            }
          }
          variants(first: 50) {
            edges {
              node {
                id
                title
                sku
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
                image {
                  url
                  altText
                }
              }
            }
          }
          options {
            id
            name
            values
          }
          collections(first: 5) {
            edges {
              node {
                id
                handle
                title
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// GraphQL query to fetch a single product by handle
const GET_PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      productType
      vendor
      tags
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            id
            url
            altText
            width
            height
          }
        }
      }
      variants(first: 50) {
        edges {
          node {
            id
            title
            sku
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            availableForSale
            selectedOptions {
              name
              value
            }
          }
        }
      }
      options {
        id
        name
        values
      }
      collections(first: 5) {
        edges {
          node {
            id
            handle
            title
          }
        }
      }
    }
  }
`;

// GraphQL query to fetch all collections
const GET_ALL_COLLECTIONS_QUERY = `
  query GetAllCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          handle
          title
          description
          image {
            url
            altText
          }
          products(first: 50) {
            edges {
              node {
                id
                handle
              }
            }
          }
        }
      }
    }
  }
`;

// Types for Shopify data
export interface ShopifyImage {
  id: string;
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
  image?: { url: string; altText: string | null };
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  productType: string;
  vendor: string;
  tags: string[];
  price: number;
  originalPrice: number;
  images: ShopifyImage[];
  variants: ShopifyVariant[];
  options: { id: string; name: string; values: string[] }[];
  collections: { id: string; handle: string; title: string }[];
  sizes: string[];
  colors: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: { url: string; altText: string | null } | null;
  productHandles: string[];
}

// Helper function to make GraphQL requests
async function shopifyFetch<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
  const response = await fetch(STOREFRONT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();

  if (json.errors) {
    console.error('Shopify GraphQL errors:', json.errors);
    throw new Error(json.errors[0]?.message || 'GraphQL query failed');
  }

  return json.data;
}

// Parse Shopify product data to our format
function parseShopifyProduct(node: any): ShopifyProduct {
  const images = node.images.edges.map((edge: any) => edge.node);
  const variants = node.variants.edges.map((edge: any) => ({
    id: edge.node.id,
    title: edge.node.title,
    sku: edge.node.sku || '',
    price: parseFloat(edge.node.price.amount),
    compareAtPrice: edge.node.compareAtPrice ? parseFloat(edge.node.compareAtPrice.amount) : null,
    availableForSale: edge.node.availableForSale,
    selectedOptions: edge.node.selectedOptions,
    image: edge.node.image,
  }));

  // Extract sizes and colors from options
  const sizeOption = node.options.find((opt: any) =>
    opt.name.toLowerCase() === 'size' || opt.name.toLowerCase() === 'sizes'
  );
  const colorOption = node.options.find((opt: any) =>
    opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colour' || opt.name.toLowerCase() === 'colors'
  );

  const price = parseFloat(node.priceRange.minVariantPrice.amount);
  const compareAtPrice = node.compareAtPriceRange?.minVariantPrice?.amount;
  const originalPrice = compareAtPrice ? parseFloat(compareAtPrice) : price * 2; // Default to 2x if no compare price

  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description || '',
    descriptionHtml: node.descriptionHtml || '',
    productType: node.productType || '',
    vendor: node.vendor || '',
    tags: node.tags || [],
    price,
    originalPrice,
    images,
    variants,
    options: node.options,
    collections: node.collections?.edges?.map((edge: any) => edge.node) || [],
    sizes: sizeOption?.values || ['S', 'M', 'L', 'XL'],
    colors: colorOption?.values || [],
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
  };
}

// Fetch all products from Shopify
export async function fetchAllShopifyProducts(): Promise<ShopifyProduct[]> {
  try {
    console.log('🛒 Fetching products from Shopify...');
    const data = await shopifyFetch<{ products: { edges: any[] } }>(
      GET_ALL_PRODUCTS_QUERY,
      { first: 100 }
    );

    const products = data.products.edges.map((edge) => parseShopifyProduct(edge.node));
    console.log(`✅ Fetched ${products.length} products from Shopify`);
    return products;
  } catch (error) {
    console.error('❌ Error fetching Shopify products:', error);
    throw error;
  }
}

// Fetch a single product by handle
export async function fetchShopifyProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  try {
    const data = await shopifyFetch<{ productByHandle: any }>(
      GET_PRODUCT_BY_HANDLE_QUERY,
      { handle }
    );

    if (!data.productByHandle) {
      return null;
    }

    return parseShopifyProduct(data.productByHandle);
  } catch (error) {
    console.error(`Error fetching product ${handle}:`, error);
    return null;
  }
}

// Fetch all collections from Shopify
export async function fetchAllShopifyCollections(): Promise<ShopifyCollection[]> {
  try {
    console.log('📦 Fetching collections from Shopify...');
    const data = await shopifyFetch<{ collections: { edges: any[] } }>(
      GET_ALL_COLLECTIONS_QUERY,
      { first: 50 }
    );

    const collections = data.collections.edges.map((edge) => ({
      id: edge.node.id,
      handle: edge.node.handle,
      title: edge.node.title,
      description: edge.node.description || '',
      image: edge.node.image,
      productHandles: edge.node.products.edges.map((p: any) => p.node.handle),
    }));

    console.log(`✅ Fetched ${collections.length} collections from Shopify`);
    return collections;
  } catch (error) {
    console.error('❌ Error fetching Shopify collections:', error);
    throw error;
  }
}

// Convert Shopify product to local Product format (for compatibility)
export function shopifyToLocalProduct(shopifyProduct: ShopifyProduct, index: number): any {
  return {
    id: index + 1, // Local numeric ID
    shopifyId: shopifyProduct.id,
    handle: shopifyProduct.handle,
    name: shopifyProduct.title,
    price: shopifyProduct.price,
    originalPrice: shopifyProduct.originalPrice,
    image: shopifyProduct.images[0]?.url || '/placeholder.jpg',
    images: shopifyProduct.images.map(img => img.url),
    description: shopifyProduct.description,
    descriptionHtml: shopifyProduct.descriptionHtml,
    type: (shopifyProduct.productType?.toLowerCase() || 'tee') as any,
    rating: 4.5 + Math.random() * 0.5, // Random rating for now
    reviews: Math.floor(Math.random() * 200) + 50,
    sizes: shopifyProduct.sizes,
    colors: shopifyProduct.colors,
    tags: shopifyProduct.tags,
    collections: shopifyProduct.collections.map(c => c.title),
    inStock: shopifyProduct.variants.some(v => v.availableForSale),
    variants: shopifyProduct.variants,
  };
}

// Import all Shopify products and convert to local format
export async function importShopifyProducts(): Promise<any[]> {
  const shopifyProducts = await fetchAllShopifyProducts();
  return shopifyProducts.map((product, index) => shopifyToLocalProduct(product, index));
}
