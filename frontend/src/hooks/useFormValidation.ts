import { z } from 'zod';
import { useEffect, useState } from 'react';

type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

export function useFormValidation<T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  values: T
) {
  const [validationState, setValidationState] = useState<ValidationResult>({
    isValid: false,
    errors: {},
  });
  const [isDirty, setIsDirty] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<keyof T, boolean>>(
    () => {
      const initialTouched: Record<string, boolean> = {};
      Object.keys(values).forEach((key) => {
        initialTouched[key] = false;
      });
      return initialTouched as Record<keyof T, boolean>;
    }
  );

  // Validate the entire form
  const validateForm = (): ValidationResult => {
    try {
      schema.parse(values);
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        return { isValid: false, errors };
      }
      return { isValid: false, errors: { form: 'An unknown error occurred' } };
    }
  };

  // Validate a single field
  const validateField = (fieldName: string) => {
    const fieldSchema = getFieldSchema(schema, fieldName);
    if (!fieldSchema) return true;

    try {
      fieldSchema.parse(values[fieldName]);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message || 'Invalid field';
      }
      return 'Invalid field';
    }
  };

  // Helper to get schema for a specific field
  const getFieldSchema = (schema: z.ZodSchema, fieldPath: string) => {
    const path = fieldPath.split('.');
    let currentSchema: any = schema;

    for (const key of path) {
      if (currentSchema && typeof currentSchema === 'object' && 'shape' in currentSchema) {
        currentSchema = currentSchema.shape[key];
      } else if (currentSchema && typeof currentSchema === 'object' && key in currentSchema) {
        currentSchema = currentSchema[key];
      } else {
        return null;
      }
    }

    return currentSchema || null;
  };

  // Mark a field as touched
  const setFieldTouched = (fieldName: keyof T) => {
    setTouchedFields((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
    setIsDirty(true);
  };

  // Reset the form state
  const resetForm = () => {
    setValidationState({ isValid: false, errors: {} });
    setIsDirty(false);
    setTouchedFields((prev) => {
      const newTouched = { ...prev };
      Object.keys(newTouched).forEach((key) => {
        newTouched[key as keyof T] = false;
      });
      return newTouched;
    });
  };

  // Get field props for form inputs
  const getFieldProps = (fieldName: keyof T) => ({
    name: fieldName,
    value: values[fieldName],
    error: touchedFields[fieldName] ? validationState.errors[fieldName as string] : undefined,
    onBlur: () => setFieldTouched(fieldName),
  });

  // Validate on mount and when values change
  useEffect(() => {
    if (isDirty) {
      const result = validateForm();
      setValidationState(result);
    }
  }, [values, isDirty]);

  return {
    ...validationState,
    validateForm,
    validateField,
    setFieldTouched,
    getFieldProps,
    resetForm,
    isDirty,
    touched: touchedFields,
    setTouched: setTouchedFields,
  };
}

// Common validation schemas
export const validationSchemas = {
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  url: z.string().url('Invalid URL'),
  requiredString: z.string().min(1, 'This field is required'),
  positiveNumber: z.number().positive('Must be a positive number'),
  nonNegativeNumber: z.number().min(0, 'Cannot be negative'),
  date: z.string().or(z.date()).refine(
    (val) => {
      if (val instanceof Date) return !isNaN(val.getTime());
      return !isNaN(new Date(val).getTime());
    },
    { message: 'Invalid date' }
  ),
};

// Helper to create a schema for a form
export function createFormSchema<T extends Record<string, z.ZodTypeAny>>(fields: T) {
  return z.object(fields);
}
