import { PRODUCT_QUERY } from "./pdpquery"; 
import { OPTIONS_QUERY } from "./collectionqueries";
import { COLLECTION_PRODUCTS_QUERY } from "./collectionqueries";
import { cheaplyGetShopifyQueryRunner } from "./selectors";

async function revalidateProduct(productHandle, numVariants = 5) {
  const queryRunner = await cheaplyGetShopifyQueryRunner();
  if (!queryRunner) {
    console.error("Failed to revalidate caches for product!");
  }

  queryRunner.runQuery(
    'query',
    PRODUCT_QUERY,
    {
      productHandle
    },
    {
      cachePolicy: 'network-only'
    }
  );
  queryRunner.runQuery(
    'query',
    OPTIONS_QUERY,
    {
      handle: productHandle,
      numVariants
    },
    {
      cachePolicy: 'network-only'
    }
  )
}

async function revalidateCollection(handle) {
  const queryRunner = await cheaplyGetShopifyQueryRunner();
  if (!queryRunner) {
    console.error("Failed to revalidate caches for product!");
  }
  queryRunner.runQuery(
    'query',
    COLLECTION_PRODUCTS_QUERY,
    {
      handle,
      first: 12,
      after: null,
      sortKey: 'BEST_SELLING',
      reverse: false,
      filters: []
    },
    {
      cachePolicy: 'network-only'
    }
  );
}

export async function fillCaches() {
  // revalidateProduct();

  const collections = [
    'hair-care', 
    'pore-care', 
    'face-care', 
    'night-care', 
    'anti-ageing', 
    'face-serums',
    'bestsellers',
    'makeup'
  ];
  for (let i = 0; i < collections.length; ++i) {
    revalidateCollection(collections[i]);
  }
}
