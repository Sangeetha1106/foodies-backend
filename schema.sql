-- Final Food Ordering App Database Schema
-- Ensuring all tables are dropped and recreated correctly

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: foods
CREATE TABLE IF NOT EXISTS foods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image TEXT NOT NULL,
    description TEXT DEFAULT 'Delicious food item',
    category VARCHAR(50) DEFAULT 'General'
);

-- Table: cart
CREATE TABLE IF NOT EXISTS cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    food_id INTEGER REFERENCES foods(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    UNIQUE(user_id, food_id)
);

-- Table: orders
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Order Placed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: order_items
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    food_id INTEGER REFERENCES foods(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Seed requested food items (Only if not already present)
INSERT INTO foods (name, price, image, description, category) 
SELECT * FROM (VALUES
('Burger', 120, 'burger.jpg', 'Juicy grilled beef burger with fresh lettuce and tomato', 'Fast Food'),
('Pizza', 250, 'pizza.jpg', 'Classic pepperoni pizza with melted mozzarella', 'Fast Food'),
('Pasta', 180, 'pasta.jpg', 'Creamy alfredo pasta with parmesan cheese', 'Italian'),
('Sandwich', 100, 'sandwich.jpg', 'Triple decker club sandwich with fries', 'Fast Food'),
('Fries', 90, 'fries.jpg', 'Crispy golden french fries with sea salt', 'Snacks'),
('Noodles', 160, 'noodles.jpg', 'Spicy schezwan noodles with vegetables', 'Chinese'),
('Fried Rice', 170, 'friedrice.jpg', 'Veg fried rice with aromatic spices', 'Chinese'),
('Ice Cream', 80, 'icecream.jpg', 'Vanilla bean ice cream with chocolate sauce', 'Dessert'),
('Juice', 70, 'juice.jpg', 'Freshly squeezed orange juice', 'Beverages'),
('Donut', 60, 'donut.jpg', 'Glazed donut with colorful sprinkles', 'Dessert'),
('Cake', 450, 'cake.jpg', 'Rich chocolate truffle cake', 'Dessert'),
('Biryani', 220, 'biryani.jpg', 'Authentic Hyderabadi chicken biryani', 'Main Course'),
('Shawarma', 150, 'shawarma.jpg', 'Middle Eastern chicken shawarma wrap', 'Main Course'),
('Sushi', 350, 'sushi.jpg', 'Assorted sushi platter with wasabi', 'Japanese'),
('Taco', 110, 'taco.jpg', 'Mexican beef tacos with salsa', 'Main Course'),
('Hot Dog', 95, 'hotdog.jpg', 'Classic hot dog with mustard and ketchup', 'Snacks'),
('Momos', 140, 'momos.jpg', 'Steamed vegetable momos with spicy chutney', 'Snacks'),
('Paneer Tikka', 180, 'paneertikka.jpg', 'Grilled paneer cubes with mint chutney', 'Main Course')
) AS t(name, price, image, description, category)
WHERE NOT EXISTS (SELECT 1 FROM foods);
