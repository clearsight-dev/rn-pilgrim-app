export const checkValidCollection = (
  productCollectionIds,
  validCollectionIds,
) => {
  // If no collections specified, rule applies to all products
  if (!validCollectionIds || validCollectionIds.length === 0) {
    return true;
  }

  return productCollectionIds.some(collectionId =>
    validCollectionIds.includes(collectionId),
  );
};
