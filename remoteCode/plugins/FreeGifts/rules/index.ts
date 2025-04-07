import {executeSpendingXAmountRule} from './executeSpendingXAmountRule';
import {executeSpendingXAmountInCollectionYRule} from './executeSpendingXAmountInCollectionYRule';
import {executeBuyXProductFromCollectionYRule} from './executeBuyXProductFromCollectionYRule';

const RULE_EXECUTION_MAP = {
  SPENDING_X_AMOUNT: executeSpendingXAmountRule,
  SPENDING_X_AMOUNT_IN_COLLECTION_Y: executeSpendingXAmountInCollectionYRule,
  BUY_X_PRODUCT_FROM_COLLECTION_Y: executeBuyXProductFromCollectionYRule,
};

export default RULE_EXECUTION_MAP;
