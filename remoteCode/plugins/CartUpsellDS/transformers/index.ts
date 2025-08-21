const transformCartUpsellRule = data => {
  const ruleFields = data.fields;
  const transformedRule = {};
  let applicableCollections = [];

  ruleFields?.forEach(f => {
    if (f.key === 'applicable_collections') {
      applicableCollections = [];
      const collectionsData = f?.references?.nodes;
      collectionsData?.forEach(c => {
        applicableCollections.push(c);
      });
      transformedRule['collections'] = applicableCollections;
    } else if (f.type === 'number_integer') {
      transformedRule[f.key] = parseInt(f.value, 10);
    } else {
      transformedRule[f.key] = f.value;
    }
  });

  return transformedRule;
};

export const TransformCartUpsellConfig = (data: any) => {
  const activeConfigs = data?.filter(
    v => v?.node?.fields?.find(f => f?.key === 'is_active')?.value === 'true',
  );
  if (!activeConfigs.length) {
    return null;
  }

  const metaFields = activeConfigs[0]?.node?.fields;
  const transformedConfig = {};

  metaFields?.forEach(f => {
    if (f.key === 'rules') {
      const rules = f.references?.nodes?.map(r => transformCartUpsellRule(r));
      transformedConfig['rules'] = rules;
    } else if (f.key === 'available_coupons') {
      const availableCoupons = f.references?.nodes?.map(c =>
        transformCartUpsellRule(c),
      );
      transformedConfig['available_coupons'] = availableCoupons;
    } else {
      transformedConfig[f.key] = f.value;
    }
  });

  return transformedConfig;
};
