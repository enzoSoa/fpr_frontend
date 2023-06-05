import { Condition, Schema } from "..";

const passwordConditions: Condition[] = [
  {
    verificationMethod: (data) => (data?.length ?? 0) >= 8,
    errorMessage: 'must be at least 8 characters long'
  },
  {
    verificationMethod: (data) => /[a-z]/.test(data ?? ''),
    errorMessage: 'must contain at least one lowercase letter'
  },
  {
    verificationMethod: (data) => /[A-Z]/.test(data ?? ''),
    errorMessage: 'must contain at least one uppercase letter'
  },
  {
    verificationMethod: (data) => /[0-9]/.test(data ?? ''),
    errorMessage: 'must contain at least one number'
  }
];

export const passwordSchema: Schema = {
  key: 'password',
  label: 'password',
  type: 'password',
  required: true,
  conditions: passwordConditions
};
