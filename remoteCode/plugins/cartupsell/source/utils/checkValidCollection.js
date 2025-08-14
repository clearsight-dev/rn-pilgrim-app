export const checkValidCollection = (
  productCollectionIds,
  validCollectionIds,
) => {
  return productCollectionIds.some(collectionId =>
    validCollectionIds.includes(collectionId),
  );
};
