import * as yup from 'yup';

export const registerSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .required('Name is required'),
  email: yup
    .string()
    .trim()
    .email('Please provide a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  phone: yup
    .string()
    .trim()
    .nullable(),
  address: yup
    .string()
    .trim()
    .nullable(),
  role: yup
    .string()
    .oneOf(['customer', 'admin'], 'Invalid user role')
    .default('customer')
});

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email('Please provide a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
});

/**
 * Express middleware generator for Yup validation
 * @param {yup.ObjectSchema} schema 
 */
export const validate = (schema) => async (req, res, next) => {
  try {
    const validatedData = await schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    req.body = validatedData;
    next();
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      const errors = err.inner.map((e) => ({
        field: e.path,
        message: e.message,
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }
    return res.status(500).json({ success: false, message: 'Internal validation error' });
  }
};
