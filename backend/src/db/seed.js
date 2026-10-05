import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import pool from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeed() {
  const client = await pool.connect();
  try {
    console.log('--- Starting Database Seeding ---');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await client.query(schemaSql);
    console.log('✓ Schema applied successfully');

    // 0. Seed Users (Admin & Customer)
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('AdminPassword123!', salt);
    const customerPass = await bcrypt.hash('CustomerPassword123!', salt);

    const adminUser = await client.query(
      `INSERT INTO users (name, email, password_hash, phone, address, role)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;`,
      ['Chef Mario (Store Admin)', 'admin@bellacrust.com', adminPass, '+1 (800) 555-7499', '142 Stone Oven Lane, Little Italy', 'admin']
    );

    const customerUser = await client.query(
      `INSERT INTO users (name, email, password_hash, phone, address, role)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;`,
      ['Alexander Wright', 'alex.wright@example.com', customerPass, '+1 (555) 349-8812', '742 Evergreen Terrace, Apt 4B, Springfield', 'customer']
    );
    console.log('✓ Initial Users seeded (Admin & Customer)');

    // 1. Insert Categories
    const categoriesData = [
      { slug: 'all', name: 'All Pizzas', icon: 'Pizza', display_order: 1 },
      { slug: 'classics', name: 'Timeless Classics', icon: 'Flame', display_order: 2 },
      { slug: 'signature', name: "Chef's Signature", icon: 'Sparkles', display_order: 3 },
      { slug: 'meat', name: 'Meat Feast', icon: 'Drumstick', display_order: 4 },
      { slug: 'veggie', name: 'Veggie Paradise', icon: 'Leaf', display_order: 5 },
      { slug: 'spicy', name: 'Fiery & Spicy', icon: 'Zap', display_order: 6 },
    ];

    const categoryMap = {};
    for (const cat of categoriesData) {
      if (cat.slug === 'all') continue;
      const res = await client.query(
        'INSERT INTO categories (slug, name, icon, display_order) VALUES ($1, $2, $3, $4) RETURNING id, slug;',
        [cat.slug, cat.name, cat.icon, cat.display_order]
      );
      categoryMap[cat.slug] = res.rows[0].id;
    }
    console.log('✓ Categories seeded');

    // 2. Insert Sizes
    const sizes = [
      { name: 'Personal (8")', code: 'personal', price_multiplier: 0.80, slices: 4, serves: '1 Person' },
      { name: 'Medium (10")', code: 'medium', price_multiplier: 1.00, slices: 6, serves: '1-2 Persons' },
      { name: 'Large (12")', code: 'large', price_multiplier: 1.35, slices: 8, serves: '2-3 Persons' },
      { name: 'Monster XL (16")', code: 'xl', price_multiplier: 1.75, slices: 12, serves: '4-5 Persons' },
    ];
    for (const size of sizes) {
      await client.query(
        'INSERT INTO sizes (name, code, price_multiplier, slices, serves) VALUES ($1, $2, $3, $4, $5);',
        [size.name, size.code, size.price_multiplier, size.slices, size.serves]
      );
    }
    console.log('✓ Sizes seeded');

    // 3. Insert Crusts
    const crusts = [
      { name: 'Classic Stone-Baked', code: 'stone_baked', description: 'Hand-stretched dough with airy, blistered crust', extra_price: 0.00 },
      { name: 'Thin & Crispy Roman', code: 'thin_crispy', description: 'Ultra-thin, crunch in every single bite', extra_price: 0.50 },
      { name: 'Double Cheese Burst', code: 'cheese_burst', description: 'Molten blend of cheddar & mozzarella inside the rim', extra_price: 2.50 },
      { name: 'Garlic Herb Stuffed Crust', code: 'garlic_stuffed', description: 'Stuffed with melted cheese & roasted garlic herb butter', extra_price: 2.25 },
      { name: 'Gluten-Friendly Cauliflower', code: 'cauliflower', description: 'Crisp keto & gluten-sensitive crust made from cauliflower', extra_price: 3.00 },
    ];
    for (const crust of crusts) {
      await client.query(
        'INSERT INTO crusts (name, code, description, extra_price) VALUES ($1, $2, $3, $4);',
        [crust.name, crust.code, crust.description, crust.extra_price]
      );
    }
    console.log('✓ Crusts seeded');

    // 4. Insert Toppings
    const toppings = [
      { name: 'Extra Mozzarella di Bufala', category: 'cheese', price: 2.00, is_veg: true },
      { name: 'Aged Shaved Parmesan', category: 'cheese', price: 1.75, is_veg: true },
      { name: 'Smoked Gouda & Ricotta', category: 'cheese', price: 2.25, is_veg: true },
      { name: 'Crispy Cupping Pepperoni', category: 'meat', price: 2.50, is_veg: false },
      { name: 'Spicy Italian Fennel Sausage', category: 'meat', price: 2.50, is_veg: false },
      { name: 'Hickory Smoked Bacon', category: 'meat', price: 2.25, is_veg: false },
      { name: 'Char-Grilled Herb Chicken', category: 'meat', price: 2.25, is_veg: false },
      { name: 'Wild Forest Mushrooms', category: 'veggie', price: 1.50, is_veg: true },
      { name: 'Kalamata Black Olives', category: 'veggie', price: 1.25, is_veg: true },
      { name: 'Fire-Roasted Jalapeños', category: 'veggie', price: 1.25, is_veg: true },
      { name: 'Caramelized Sweet Onions', category: 'veggie', price: 1.25, is_veg: true },
      { name: 'Sun-Dried Tomatoes & Basil', category: 'veggie', price: 1.50, is_veg: true },
      { name: 'Organic Baby Spinach', category: 'veggie', price: 1.25, is_veg: true },
      { name: 'Sweet Charred Corn', category: 'veggie', price: 1.00, is_veg: true },
      { name: 'Hot Honey Drizzle', category: 'sauce', price: 1.50, is_veg: true },
      { name: 'Truffle Oil Infusion', category: 'sauce', price: 2.00, is_veg: true },
    ];
    for (const top of toppings) {
      await client.query(
        'INSERT INTO toppings (name, category, price, is_veg) VALUES ($1, $2, $3, $4);',
        [top.name, top.category, top.price, top.is_veg]
      );
    }
    console.log('✓ Toppings seeded');

    // 5. Insert Pizzas
    const pizzas = [
      {
        category_id: categoryMap['classics'],
        name: 'Neapolitan Margherita D.O.P.',
        slug: 'margherita-dop',
        description: 'San Marzano tomato sauce, fresh buffalo mozzarella, fragrant Genovese basil, and extra virgin cold-pressed olive oil.',
        image_url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
        base_price: 13.99,
        rating: 4.9,
        reviews_count: 142,
        prep_time: '15-18 mins',
        calories: 680,
        is_veg: true,
        is_spicy: false,
        is_bestseller: true,
        ingredients: ['San Marzano Tomatoes', 'Buffalo Mozzarella', 'Fresh Basil', 'EVOO', 'Sea Salt']
      },
      {
        category_id: categoryMap['meat'],
        name: 'Double Cupped Pepperoni & Hot Honey',
        slug: 'cupped-pepperoni-hot-honey',
        description: 'Over 60 crispy edge-curling pepperoni cups loaded over aged mozzarella, finished with a generous drizzle of spicy Mike’s Hot Honey.',
        image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
        base_price: 16.99,
        rating: 5.0,
        reviews_count: 289,
        prep_time: '15-20 mins',
        calories: 920,
        is_veg: false,
        is_spicy: true,
        is_bestseller: true,
        ingredients: ['Crispy Pepperoni Cups', 'Whole Milk Mozzarella', 'Hot Honey Drizzle', 'Herbed Tomato Sauce']
      },
      {
        category_id: categoryMap['signature'],
        name: 'Black Truffle Wild Mushroom & Ricotta',
        slug: 'truffle-mushroom-ricotta',
        description: 'Cremini, shiitake, and portobello mushrooms sautéed in garlic thyme butter, creamy whipped ricotta, fior di latte, and white truffle oil drizzle.',
        image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
        base_price: 18.50,
        rating: 4.9,
        reviews_count: 98,
        prep_time: '18-22 mins',
        calories: 780,
        is_veg: true,
        is_spicy: false,
        is_bestseller: true,
        ingredients: ['Wild Mushrooms', 'Whipped Ricotta', 'Fior di Latte', 'White Truffle Oil', 'Fresh Thyme']
      },
      {
        category_id: categoryMap['meat'],
        name: 'Smoky Texas BBQ Brisket & Bacon',
        slug: 'smoky-texas-bbq-brisket',
        description: 'Slow-smoked pulled brisket, hickory bacon bits, red onion slivers, smoked Gouda and tangy Texas bourbon BBQ glaze.',
        image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
        base_price: 18.99,
        rating: 4.8,
        reviews_count: 115,
        prep_time: '18-22 mins',
        calories: 1040,
        is_veg: false,
        is_spicy: false,
        is_bestseller: false,
        ingredients: ['Smoked Brisket', 'Hickory Bacon', 'Bourbon BBQ Sauce', 'Smoked Gouda', 'Red Onions']
      },
      {
        category_id: categoryMap['spicy'],
        name: 'The Volcano Inferno Diavola',
        slug: 'volcano-inferno-diavola',
        description: 'Calabrian chili paste, spicy Spianata salami, pickled habaneros, jalapeños, smoked mozzarella, and crushed red chili flakes.',
        image_url: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=800&q=80',
        base_price: 17.49,
        rating: 4.7,
        reviews_count: 84,
        prep_time: '16-20 mins',
        calories: 890,
        is_veg: false,
        is_spicy: true,
        is_bestseller: false,
        ingredients: ['Spicy Salami', 'Calabrian Chili', 'Pickled Habaneros', 'Jalapeños', 'Chili Flakes']
      },
      {
        category_id: categoryMap['veggie'],
        name: 'Mediterranean Sun-Kissed Garden',
        slug: 'mediterranean-garden',
        description: 'Basil pesto base, kalamata olives, sun-dried tomatoes, artichoke hearts, roasted bell peppers, Greek feta cheese, and arugula.',
        image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
        base_price: 15.99,
        rating: 4.8,
        reviews_count: 73,
        prep_time: '16-20 mins',
        calories: 710,
        is_veg: true,
        is_spicy: false,
        is_bestseller: false,
        ingredients: ['Pesto Sauce', 'Artichoke Hearts', 'Kalamata Olives', 'Greek Feta', 'Sun-Dried Tomatoes']
      },
      {
        category_id: categoryMap['classics'],
        name: 'Quattro Formaggi Gold Reserve',
        slug: 'quattro-formaggi-gold',
        description: 'A decadent four-cheese harmony: aged Gorgonzola, sweet Fontina, creamy Fior di Latte, and 24-month Parmigiano Reggiano.',
        image_url: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&w=800&q=80',
        base_price: 16.50,
        rating: 4.9,
        reviews_count: 156,
        prep_time: '14-18 mins',
        calories: 850,
        is_veg: true,
        is_spicy: false,
        is_bestseller: true,
        ingredients: ['Gorgonzola', 'Fontina', 'Fior di Latte', 'Parmigiano Reggiano', 'Cracked Black Pepper']
      },
      {
        category_id: categoryMap['meat'],
        name: 'The Carnivore Grand Slam',
        slug: 'carnivore-grand-slam',
        description: 'Crispy pepperoni, sweet Italian fennel sausage, smoked ham, seasoned ground beef, and crispy pancetta over rich herb tomato sauce.',
        image_url: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=800&q=80',
        base_price: 19.49,
        rating: 4.9,
        reviews_count: 210,
        prep_time: '18-24 mins',
        calories: 1120,
        is_veg: false,
        is_spicy: false,
        is_bestseller: true,
        ingredients: ['Pepperoni', 'Italian Sausage', 'Ham', 'Ground Beef', 'Pancetta', 'Mozzarella']
      },
      {
        category_id: categoryMap['signature'],
        name: 'Crispy Buffalo Chicken & Blue Cheese',
        slug: 'crispy-buffalo-chicken',
        description: 'Crispy tender chicken breast tossed in tangy Buffalo sauce, creamy blue cheese crumbles, ranch drizzle, and crunchy scallions.',
        image_url: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=800&q=80',
        base_price: 17.99,
        rating: 4.8,
        reviews_count: 94,
        prep_time: '18-22 mins',
        calories: 960,
        is_veg: false,
        is_spicy: true,
        is_bestseller: false,
        ingredients: ['Crispy Chicken', 'Buffalo Hot Sauce', 'Gorgonzola Crumble', 'Ranch Drizzle', 'Scallions']
      },
      {
        category_id: categoryMap['veggie'],
        name: 'Paneer Makhani & Charred Peppers',
        slug: 'paneer-makhani-charred-peppers',
        description: 'Marinated cottage cheese cubes in velvety rich butter tomato makhani sauce, roasted green bell peppers, red onions, and fresh cilantro.',
        image_url: 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?auto=format&fit=crop&w=800&q=80',
        base_price: 16.99,
        rating: 4.8,
        reviews_count: 88,
        prep_time: '18-22 mins',
        calories: 820,
        is_veg: true,
        is_spicy: true,
        is_bestseller: false,
        ingredients: ['Tandoori Paneer', 'Makhani Sauce', 'Bell Peppers', 'Red Onion', 'Cilantro']
      },
      {
        category_id: categoryMap['classics'],
        name: 'Prosciutto Crudo & Baby Arugula',
        slug: 'prosciutto-crudo-arugula',
        description: 'Crispy stone-baked base topped with delicate 18-month Prosciutto di Parma, dressed peppery arugula, shaved parmesan, and balsamic glaze.',
        image_url: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80',
        base_price: 18.25,
        rating: 4.9,
        reviews_count: 120,
        prep_time: '15-18 mins',
        calories: 740,
        is_veg: false,
        is_spicy: false,
        is_bestseller: false,
        ingredients: ['Prosciutto di Parma', 'Baby Arugula', 'Shaved Parmigiano', 'Balsamic Glaze', 'Mozzarella']
      },
      {
        category_id: categoryMap['signature'],
        name: 'Smoked Honey Bacon & Caramelized Pineapple',
        slug: 'honey-bacon-pineapple',
        description: 'Elevated artisanal Hawaiian with charred caramelized pineapple slices, thick-cut applewood smoked bacon, jalapeño coins, and hot honey.',
        image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
        base_price: 16.99,
        rating: 4.7,
        reviews_count: 67,
        prep_time: '16-20 mins',
        calories: 870,
        is_veg: false,
        is_spicy: true,
        is_bestseller: false,
        ingredients: ['Charred Pineapple', 'Applewood Bacon', 'Jalapeño Coins', 'Hot Honey', 'Mozzarella']
      }
    ];

    for (const p of pizzas) {
      await client.query(
        `INSERT INTO pizzas 
         (category_id, name, slug, description, image_url, base_price, rating, reviews_count, prep_time, calories, is_veg, is_spicy, is_bestseller, ingredients)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);`,
        [
          p.category_id, p.name, p.slug, p.description, p.image_url, p.base_price,
          p.rating, p.reviews_count, p.prep_time, p.calories, p.is_veg, p.is_spicy, p.is_bestseller, p.ingredients
        ]
      );
    }
    console.log('✓ Pizzas seeded');

    // 6. Insert Initial Orders for demonstration and live tracking
    const order1 = await client.query(`
      INSERT INTO orders (
        order_number, user_id, customer_name, customer_email, customer_phone, order_type, delivery_address,
        instructions, subtotal, discount, delivery_fee, tax, total_amount, payment_method, payment_status, order_status, estimated_delivery_time
      ) VALUES (
        'ORD-98214', $1, 'Alexander Wright', 'alex.wright@example.com', '+1 (555) 349-8812', 'delivery',
        '742 Evergreen Terrace, Apt 4B, Springfield', 'Please ring the bell and leave at door',
        33.98, 5.00, 2.99, 2.72, 34.69, 'Credit Card', 'paid', 'baking', '18-25 mins'
      ) RETURNING id;
    `, [customerUser.rows[0].id]);

    await client.query(`
      INSERT INTO order_items (order_id, pizza_name, size_name, crust_name, toppings, special_notes, quantity, unit_price, total_price)
      VALUES 
      ($1, 'Double Cupped Pepperoni & Hot Honey', 'Large (12")', 'Double Cheese Burst', '["Extra Mozzarella di Bufala", "Fire-Roasted Jalapeños"]', 'Extra hot honey please', 1, 25.44, 25.44),
      ($1, 'Neapolitan Margherita D.O.P.', 'Medium (10")', 'Classic Stone-Baked', '[]', '', 1, 13.99, 13.99);
    `, [order1.rows[0].id]);

    const order2 = await client.query(`
      INSERT INTO orders (
        order_number, customer_name, customer_email, customer_phone, order_type, delivery_address,
        instructions, subtotal, discount, delivery_fee, tax, total_amount, payment_method, payment_status, order_status, estimated_delivery_time
      ) VALUES (
        'ORD-98215', 'Sophia Chen', 'sophia.c@example.com', '+1 (555) 782-9011', 'delivery',
        '104 King Street, Suite 12, Financial District', 'Call upon arrival',
        18.50, 0.00, 2.99, 1.48, 22.97, 'Cash on Delivery', 'pending', 'out_for_delivery', '10 mins'
      ) RETURNING id;
    `);

    await client.query(`
      INSERT INTO order_items (order_id, pizza_name, size_name, crust_name, toppings, special_notes, quantity, unit_price, total_price)
      VALUES ($1, 'Black Truffle Wild Mushroom & Ricotta', 'Medium (10")', 'Garlic Herb Stuffed Crust', '["Truffle Oil Infusion"]', 'Crispy crust please', 1, 22.75, 22.75);
    `, [order2.rows[0].id]);

    console.log('✓ Initial demonstration orders seeded');

    // 7. Insert Customer Reviews
    const reviews = [
      {
        customer_name: 'Marco Rossi',
        rating: 5,
        comment: 'Hands down the best crust in the city! The hot honey pepperoni is an absolute game-changer. Arrived piping hot in 25 minutes.',
        pizza_name: 'Double Cupped Pepperoni & Hot Honey',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
      },
      {
        customer_name: 'Elena Rostova',
        rating: 5,
        comment: 'The Truffle Ricotta pizza was culinary heaven! Authentic stone-baked flavor with blistered crust. Will definitely be a regular here.',
        pizza_name: 'Black Truffle Wild Mushroom & Ricotta',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
      },
      {
        customer_name: 'David Miller',
        rating: 5,
        comment: 'Ordering online was so smooth! Loved customizing each slice size, crust and toppings with instant price feedback. 10/10 service.',
        pizza_name: 'Neapolitan Margherita D.O.P.',
        avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80'
      }
    ];

    for (const r of reviews) {
      await client.query(
        'INSERT INTO customer_reviews (customer_name, rating, comment, pizza_name, avatar_url) VALUES ($1, $2, $3, $4, $5);',
        [r.customer_name, r.rating, r.comment, r.pizza_name, r.avatar_url]
      );
    }
    console.log('✓ Customer reviews seeded');

    console.log('=== Database Seeding Completed Successfully! ===');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
