import * as yup from 'yup';

export const createOrderSchema = yup.object({
  customer_name: yup
    .string()
    .trim()
    .required('Customer name is required'),
  customer_email: yup
    .string()
    .trim()
    .email('Valid customer email is required')
    .required('Customer email is required'),
  customer_phone: yup
    .string()
    .trim()
    .required('Customer phone number is required'),
  order_type: yup
    .string()
    .oneOf(['delivery', 'pickup'])
    .default('delivery'),
  delivery_address: yup
    .string()
    .trim()
    .required('Delivery address is required'),
  instructions: yup
    .string()
    .trim()
    .nullable(),
  payment_method: yup
    .string()
    .default('cash'),
  promo_code: yup
    .string()
    .trim()
    .nullable(),
  items: yup
    .array()
    .of(
      yup.object({
        pizza_id: yup.number().nullable(),
        pizza_name: yup.string().required('Item name required'),
        size_name: yup.string().required('Size required'),
        crust_name: yup.string().required('Crust required'),
        toppings: yup.array().default([]),
        special_notes: yup.string().nullable(),
        quantity: yup.number().integer().min(1).default(1),
        unit_price: yup.number().positive().required(),
      })
    )
    .min(1, 'Order must contain at least one pizza item')
    .required('Order items are required'),
});
