import {CreateAccountRequest} from '../../core/services/account.service';

type SavingsProductType = 'basic-savings' | 'high-yield-savings' | 'cd';

const PRODUCT_TYPE_MAP: Record<SavingsProductType, CreateAccountRequest['accountType']> = {
  'basic-savings': 'BASIC_SAVINGS',
  'high-yield-savings': 'HIGH_YIELD_SAVINGS',
  'cd': 'CERTIFICATE_OF_DEPOSIT',
};

export function resolveAccountType(
  productType: string
): CreateAccountRequest['accountType'] {
  return PRODUCT_TYPE_MAP[productType as SavingsProductType] ?? 'BASIC_SAVINGS';
}
