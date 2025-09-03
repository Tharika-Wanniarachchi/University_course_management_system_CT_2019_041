import { useState, useCallback } from 'react';
import { z, ZodSchema } from 'zod';

type ValidationErrors<T> = {
  [K in keyof T]?: string[];
};

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationSchema: ZodSchema<T>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>(
    Object.keys(initialValues).reduce(
      (acc, key) => ({ ...acc, [key]: false }),
      {} as Record<keyof T, boolean>
    )
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback((valuesToValidate: T) => {
    try {
      validationSchema.parse(valuesToValidate);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ValidationErrors<T> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof T;
          if (path) {
            // Initialize as empty array if not exists, then add the error message
            if (!newErrors[path]) {
              newErrors[path] = [];
            }
            newErrors[path]?.push(err.message);
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [validationSchema]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      
      // Handle different input types
      let finalValue: any = value;
      if (type === 'number') {
        finalValue = value === '' ? '' : Number(value);
      } else if (type === 'checkbox') {
        finalValue = (e.target as HTMLInputElement).checked;
      }

      setValues((prev) => ({
        ...prev,
        [name]: finalValue,
      }));

      // If the field has been touched before, validate on change
      if (touched[name as keyof T]) {
        validate({ ...values, [name]: finalValue });
      }
    },
    [touched, validate, values]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));
      validate(values);
    },
    [validate, values]
  );

  const setFieldValue = useCallback(
    (name: keyof T, value: any) => {
      setValues((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (touched[name]) {
        validate({ ...values, [name]: value });
      }
    },
    [touched, validate, values]
  );

  const setFieldTouched = useCallback((name: keyof T) => {
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched(
      Object.keys(initialValues).reduce(
        (acc, key) => ({ ...acc, [key]: false }),
        {} as Record<keyof T, boolean>
      )
    );
  }, [initialValues]);

  const getFieldProps = useCallback(
    (name: keyof T) => ({
      name,
      value: values[name] ?? '',
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched[name] ? errors[name] : undefined,
    }),
    [values, handleChange, handleBlur, touched, errors]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldTouched,
    setErrors,
    setValues,
    setTouched,
    validate: () => validate(values),
    resetForm,
    getFieldProps,
    // For form submission
    getFormProps: () => ({
      onSubmit: async (e: React.FormEvent, callback: (values: T) => Promise<void>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTouched(
          Object.keys(values).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            {} as Record<keyof T, boolean>
          )
        );

        const isValid = validate(values);
        if (isValid) {
          try {
            await callback(values);
          } catch (error) {
            console.error('Form submission error:', error);
            throw error;
          } finally {
            setIsSubmitting(false);
          }
        } else {
          setIsSubmitting(false);
        }
      },
    }),
  };
}
