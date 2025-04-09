import { PRODUCT_QUERY } from "./pdpquery"; 
import { fetchCollectionData, OPTIONS_QUERY } from "./collectionqueries";
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
  return fetchCollectionData(
    handle,  
    12, // numitems
    null, // cursor
    'BEST_SELLING', // sortkey
    false, // reverse
    [], // filters
    true // useNetworkOnly
  );
}

export async function fillCaches() {
  // revalidateProduct();

  const collections = [
    'bestsellers',
    'new-launch',
    'hair-care', 
    'pore-care', 
    'makeup',

    'face-care', 
    'night-care', 
    'hydration',
    'night-care',
    'hair-spa',
    'sunscreen',
  ];
  for (let i = 0; i < collections.length; ++i) {
    revalidateCollection(collections[i]);
    if (i % 5 === 0) {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve({});
        }, 1000)
      })
    }
  }
}
