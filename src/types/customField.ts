export type CustomFieldType = 'text' | 'checkbox' | 'radio' | 'dropdown' | 'number' | 'date';

export interface CustomFieldOption {
  label: string;
  value: string;
}

export interface CustomField {
  id: string;
  label: string;
  type: CustomFieldType;
  required?: boolean;
  options?: CustomFieldOption[]; // for radio, dropdown
} 