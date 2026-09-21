import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import { Product } from '../models/Product.js';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

dotenv.config();

const items = [
  // BEVERAGES (30 items)
  { name: 'Single Origin Espresso', category: 'Beverages', price: 3.50, stock: 80, description: 'Rich single-origin espresso shot' },
  { name: 'Double Espresso Shot', category: 'Beverages', price: 4.25, stock: 75, description: 'Double extraction espresso' },
  { name: 'Classic Americano', category: 'Beverages', price: 4.00, stock: 90, description: 'Espresso with hot water' },
  { name: 'Velvet Flat White', category: 'Beverages', price: 4.75, stock: 65, description: 'Micro-foamed steamed milk over double espresso' },
  { name: 'Creamy Cappuccino', category: 'Beverages', price: 4.75, stock: 70, description: 'Equal parts espresso, steamed milk, and foam' },
  { name: 'Vanilla Bean Latte', category: 'Beverages', price: 5.25, stock: 60, description: 'Latte infused with Madagascar vanilla' },
  { name: 'Caramel Macchiato', category: 'Beverages', price: 5.50, stock: 55, description: 'Steamed milk, espresso, and buttery caramel drizzle' },
  { name: 'Hazelnut Mocha', category: 'Beverages', price: 5.75, stock: 50, description: 'Espresso with dark cocoa and toasted hazelnut' },
  { name: 'Nitro Cold Brew', category: 'Beverages', price: 5.25, stock: 45, description: 'Nitrogen-infused smooth cold brew coffee' },
  { name: 'Vanilla Sweet Cream Cold Brew', category: 'Beverages', price: 5.50, stock: 50, description: 'Slow-steeped cold brew with vanilla sweet cream' },
  { name: 'Ceremonial Matcha Latte', category: 'Beverages', price: 5.50, stock: 40, description: 'Uji matcha whisked with oat milk' },
  { name: 'Iced Matcha Green Tea', category: 'Beverages', price: 5.00, stock: 45, description: 'Unsweetened iced ceremonial matcha' },
  { name: 'Spiced Chai Tea Latte', category: 'Beverages', price: 4.95, stock: 60, description: 'Black tea infused with cardamom, cinnamon, and cloves' },
  { name: 'Earl Grey Lavender Tea', category: 'Beverages', price: 3.75, stock: 70, description: 'Bergamot black tea with French lavender petals' },
  { name: 'Organic Jasmine Green Tea', category: 'Beverages', price: 3.75, stock: 65, description: 'Fragrant steamed green tea leaves' },
  { name: 'Chamomile Citrus Infusion', category: 'Beverages', price: 3.75, stock: 60, description: 'Caffeine-free herbal blend with orange peel' },
  { name: 'Fresh Squeezed Orange Juice', category: 'Beverages', price: 4.50, stock: 40, description: '100% cold-pressed Valencia oranges' },
  { name: 'Green Detox Cold Pressed Juice', category: 'Beverages', price: 6.50, stock: 30, description: 'Kale, spinach, green apple, celery, and lemon' },
  { name: 'Berry Antioxidant Smoothie', category: 'Beverages', price: 6.75, stock: 35, description: 'Blueberry, raspberry, strawberry, and almond milk' },
  { name: 'Tropical Mango Banana Smoothie', category: 'Beverages', price: 6.75, stock: 35, description: 'Alphonso mango, ripe banana, and coconut yogurt' },
  { name: 'Sparkling Mineral Water 500ml', category: 'Beverages', price: 2.75, stock: 100, description: 'Natural mineral water with crisp bubbles' },
  { name: 'Still Spring Water 500ml', category: 'Beverages', price: 2.00, stock: 120, description: 'Pure mountain spring water' },
  { name: 'Raw Coconut Water', category: 'Beverages', price: 3.50, stock: 50, description: 'Electrolyte-rich young coconut water' },
  { name: 'Peach Hibiscus Iced Tea', category: 'Beverages', price: 4.25, stock: 55, description: 'Brewed herbal hibiscus with fresh peach notes' },
  { name: 'Sparkling Lemon Lime Soda', category: 'Beverages', price: 3.00, stock: 80, description: 'Craft cane sugar soda with real citrus' },
  { name: 'Ginger Lemon Kombucha', category: 'Beverages', price: 4.95, stock: 40, description: 'Fermented live probiotic tea with cold-pressed ginger' },
  { name: 'Belgian Hot Chocolate', category: 'Beverages', price: 4.50, stock: 45, description: 'Melted Belgian milk chocolate with steamed milk' },
  { name: 'Golden Turmeric Latte', category: 'Beverages', price: 5.00, stock: 35, description: 'Organic turmeric, ginger, and black pepper in almond milk' },
  { name: 'Iced Spanish Latte', category: 'Beverages', price: 5.50, stock: 50, description: 'Espresso with sweetened condensed milk and ice' },
  { name: 'Cascara Coffee Cherry Tea', category: 'Beverages', price: 4.25, stock: 30, description: 'Dried coffee cherry tea with floral notes' },

  // BAKERY (30 items)
  { name: 'French Butter Croissant', category: 'Bakery', price: 3.75, stock: 40, description: 'Flaky golden pastry made with French butter' },
  { name: 'Pain au Chocolat', category: 'Bakery', price: 4.25, stock: 35, description: 'Croissant pastry filled with dark chocolate bars' },
  { name: 'Almond Frangipane Croissant', category: 'Bakery', price: 4.75, stock: 30, description: 'Twice-baked croissant topped with sliced almonds' },
  { name: 'Cinnamon Roll with Glaze', category: 'Bakery', price: 4.50, stock: 25, description: 'Warm spiral roll with cream cheese frosting' },
  { name: 'Wild Blueberry Muffin', category: 'Bakery', price: 3.50, stock: 35, description: 'Moist muffin loaded with wild mountain blueberries' },
  { name: 'Double Dark Chocolate Muffin', category: 'Bakery', price: 3.75, stock: 30, description: 'Rich chocolate batter with chocolate chips' },
  { name: 'Banana Walnut Streusel Muffin', category: 'Bakery', price: 3.75, stock: 28, description: 'Ripe bananas and toasted walnuts with streusel' },
  { name: 'Artisan Sourdough Batard', category: 'Bakery', price: 6.50, stock: 20, description: 'Slow-fermented crusty sourdough bread' },
  { name: 'Traditional French Baguette', category: 'Bakery', price: 3.25, stock: 25, description: 'Crisp exterior with soft aerated crumb' },
  { name: 'Brioche Burger Buns (Pack of 4)', category: 'Bakery', price: 5.00, stock: 18, description: 'Buttery, golden burger buns' },
  { name: 'New York Everything Bagel', category: 'Bakery', price: 2.75, stock: 40, description: 'Topped with sesame, poppy, garlic, and sea salt' },
  { name: 'Plain Toasted Bagel & Butter', category: 'Bakery', price: 2.50, stock: 45, description: 'Classic chewy boiled bagel' },
  { name: 'Smoked Salmon Cream Cheese Bagel', category: 'Bakery', price: 7.95, stock: 20, description: 'Bagel with chive cream cheese and smoked salmon' },
  { name: 'Apple Cinnamon Danish', category: 'Bakery', price: 4.00, stock: 22, description: 'Puff pastry with spiced caramel apple filling' },
  { name: 'Raspberry Custard Tart', category: 'Bakery', price: 4.95, stock: 20, description: 'Shortcrust shell with vanilla bean custard and raspberries' },
  { name: 'Classic Pecan Tart', category: 'Bakery', price: 5.25, stock: 18, description: 'Roasted pecans in caramelized brown sugar filling' },
  { name: 'New York Style Cheesecake Slice', category: 'Bakery', price: 5.75, stock: 20, description: 'Dense, creamy cheesecake on graham cracker crust' },
  { name: 'Red Velvet Cupcake', category: 'Bakery', price: 3.95, stock: 25, description: 'Cocoa red velvet sponge with cream cheese swirl' },
  { name: 'Salted Caramel Brownie', category: 'Bakery', price: 3.50, stock: 35, description: 'Fudgy chocolate brownie with sea salt caramel' },
  { name: 'Blueberry Lemon Scone', category: 'Bakery', price: 3.75, stock: 25, description: 'Buttery scone with lemon glaze and dried blueberries' },
  { name: 'Chocolate Chip Cookie', category: 'Bakery', price: 2.50, stock: 60, description: 'Chewy center with crisp edges and semisweet chips' },
  { name: 'Oatmeal Raisin Cookie', category: 'Bakery', price: 2.50, stock: 45, description: 'Rolled oats, cinnamon, and plump raisins' },
  { name: 'French Macaron Box (6 pcs)', category: 'Bakery', price: 11.50, stock: 15, description: 'Assorted flavors: Pistachio, Vanilla, Berry, Caramel' },
  { name: 'Focaccia with Rosemary & Olive Oil', category: 'Bakery', price: 4.50, stock: 20, description: 'Fluffy Italian flatbread baked with sea salt' },
  { name: 'Cheese & Herb Twist', category: 'Bakery', price: 3.50, stock: 25, description: 'Puff pastry braided with cheddar and herbs' },
  { name: 'Gluten-Free Chocolate Muffin', category: 'Bakery', price: 4.00, stock: 20, description: 'Gluten-free dark chocolate chip muffin' },
  { name: 'Matcha Green Tea Madeleines (3 pcs)', category: 'Bakery', price: 4.25, stock: 20, description: 'Traditional French sponge tea cakes' },
  { name: 'Kouign-Amann Caramel Pastry', category: 'Bakery', price: 4.95, stock: 15, description: 'Breton layered butter cake with caramelized sugar' },
  { name: 'Carrot Cake with Cream Cheese', category: 'Bakery', price: 5.50, stock: 18, description: 'Spiced carrot sponge with crushed walnuts' },
  { name: 'Pecan Cinnamon Sticky Bun', category: 'Bakery', price: 4.75, stock: 18, description: 'Warm brioche smothered in caramel and pecans' },

  // FOOD (30 items)
  { name: 'Avocado Sourdough Toast & Poached Egg', category: 'Food', price: 9.50, stock: 25, description: 'Crushed Hass avocado, chili flakes, microgreens' },
  { name: 'Smoked Turkey Club Sandwich', category: 'Food', price: 10.50, stock: 20, description: 'Smoked turkey breast, crispy bacon, tomato, garlic aioli' },
  { name: 'Caprese Tomato Mozzarella Panini', category: 'Food', price: 8.95, stock: 22, description: 'Heirloom tomato, fresh mozzarella, pesto on ciabatta' },
  { name: 'Grilled Herb Chicken Wrap', category: 'Food', price: 9.25, stock: 25, description: 'Herb chicken breast, mixed greens, avocado ranch in tortilla' },
  { name: 'Mediterranean Falafel Bowl', category: 'Food', price: 10.00, stock: 20, description: 'Crispy falafels, hummus, cucumber, pickled cabbage, tahini' },
  { name: 'Classic Caesar Chicken Salad', category: 'Food', price: 9.75, stock: 22, description: 'Romaine hearts, grilled chicken, shaved parmesan, croutons' },
  { name: 'Teriyaki Chicken Rice Bowl', category: 'Food', price: 11.25, stock: 20, description: 'Glazed teriyaki chicken with jasmine rice and steamed broccoli' },
  { name: 'Truffle Mushroom Melt Sandwich', category: 'Food', price: 9.50, stock: 18, description: 'Sautéed mushrooms, swiss cheese, truffle butter' },
  { name: 'Smoked Salmon Poke Bowl', category: 'Food', price: 13.50, stock: 15, description: 'Sashimi salmon, sushi rice, edamame, avocado, spicy mayo' },
  { name: 'Classic BLT Sandwich', category: 'Food', price: 8.50, stock: 25, description: 'Applewood smoked bacon, crisp butter lettuce, ripe tomato' },
  { name: 'Roast Beef & Horseradish Panini', category: 'Food', price: 10.75, stock: 18, description: 'Thin sliced beef, aged cheddar, caramelized onions' },
  { name: 'Margherita Flatbread Pizza', category: 'Food', price: 8.95, stock: 20, description: 'San Marzano tomato sauce, fresh basil, mozzarella' },
  { name: 'Roasted Tomato Basil Soup (Bowl)', category: 'Food', price: 5.75, stock: 30, description: 'Creamy fire-roasted tomato soup with parmesan croutons' },
  { name: 'Wild Mushroom Soup', category: 'Food', price: 6.25, stock: 25, description: 'Earthy forest mushrooms simmered with thyme and cream' },
  { name: 'Egg Salad on Brioche', category: 'Food', price: 7.25, stock: 20, description: 'Dill egg salad, watercress on toasted brioche' },
  { name: 'Korean BBQ Pulled Pork Sandwich', category: 'Food', price: 11.00, stock: 18, description: 'Slow-cooked pork, kimchi slaw, gochujang glaze' },
  { name: 'Quinoa Veggie Harvest Bowl', category: 'Food', price: 9.75, stock: 20, description: 'Organic quinoa, roasted sweet potatoes, kale, pumpkin seeds' },
  { name: 'Chipotle Steak Quesadilla', category: 'Food', price: 10.50, stock: 20, description: 'Flank steak, peppers, monterey jack cheese, salsa' },
  { name: 'Greek Salad with Feta & Olives', category: 'Food', price: 8.50, stock: 25, description: 'Cucumbers, kalamata olives, bell peppers, oregano vinaigrette' },
  { name: 'Tuna Salad Croissant', category: 'Food', price: 8.25, stock: 20, description: 'Albacore tuna salad with celery and crisp lettuce' },
  { name: 'Crispy Tofu Veggie Wrap', category: 'Food', price: 8.75, stock: 20, description: 'Marinated crispy tofu, peanut ginger slaw in spinach wrap' },
  { name: 'Prosciutto & Fig Flatbread', category: 'Food', price: 10.25, stock: 15, description: 'Prosciutto di Parma, fig jam, goat cheese, arugula' },
  { name: 'Three Cheese Grilled Sandwich', category: 'Food', price: 7.50, stock: 30, description: 'Sharp cheddar, gruyère, and gouda on sourdough' },
  { name: 'Spinach & Feta Breakfast Wrap', category: 'Food', price: 7.95, stock: 25, description: 'Egg whites, baby spinach, crumbled feta, sundried tomatoes' },
  { name: 'Thai Peanut Noodle Salad', category: 'Food', price: 9.50, stock: 20, description: 'Rice noodles, shredded carrots, cilantro, peanut dressing' },
  { name: 'BBQ Chicken Ranch Salad', category: 'Food', price: 10.25, stock: 18, description: 'Grilled chicken, roasted corn, black beans, tortilla strips' },
  { name: 'Cubano Pressed Sandwich', category: 'Food', price: 10.50, stock: 15, description: 'Mojo pork, ham, swiss cheese, dill pickles, yellow mustard' },
  { name: 'Avocado Egg Salad Wrap', category: 'Food', price: 7.75, stock: 22, description: 'Avocado, hard-boiled eggs, dijon mustard in flour wrap' },
  { name: 'Shrimp Poke Rice Bowl', category: 'Food', price: 13.00, stock: 15, description: 'Poached shrimp, jasmine rice, seaweed salad, sesame soy' },
  { name: 'Grilled Veggie & Hummus Ciabatta', category: 'Food', price: 8.50, stock: 20, description: 'Grilled zucchini, eggplant, roasted peppers, garlic hummus' },

  // SNACKS (30 items)
  { name: 'Sea Salt Kettle Potato Chips', category: 'Snacks', price: 2.25, stock: 80, description: 'Thick cut artisan potato chips with sea salt' },
  { name: 'Smoked Hickory BBQ Chips', category: 'Snacks', price: 2.25, stock: 75, description: 'Crunchy chips with sweet and smoky BBQ seasoning' },
  { name: 'Jalapeño Cheddar Potato Chips', category: 'Snacks', price: 2.25, stock: 70, description: 'Spicy jalapeño kick with real cheddar' },
  { name: 'White Cheddar Popcorn (Bag)', category: 'Snacks', price: 2.50, stock: 65, description: 'Air-popped corn coated in aged white cheddar' },
  { name: 'Salted Caramel Gourmet Popcorn', category: 'Snacks', price: 3.25, stock: 50, description: 'Handcrafted caramel popcorn with Himalayan pink salt' },
  { name: 'Roasted Salted Almonds 100g', category: 'Snacks', price: 3.95, stock: 60, description: 'California almonds roasted with sea salt' },
  { name: 'Honey Glazed Cashews 100g', category: 'Snacks', price: 4.50, stock: 50, description: 'Whole cashews roasted with clover honey' },
  { name: 'Organic Trail Mix (Nuts & Berries)', category: 'Snacks', price: 3.75, stock: 55, description: 'Almonds, cashews, cranberries, and pumpkin seeds' },
  { name: 'Dark Chocolate Pretzel Bites', category: 'Snacks', price: 3.50, stock: 60, description: 'Crisp salted pretzels coated in 70% dark chocolate' },
  { name: 'Greek Yogurt Berry Parfait', category: 'Snacks', price: 4.75, stock: 35, description: 'Vanilla Greek yogurt, housemade honey granola, berries' },
  { name: 'Classic Hummus & Pita Crackers', category: 'Snacks', price: 4.25, stock: 40, description: 'Smooth garlic hummus with seasoned pita chips' },
  { name: 'Guacamole & Organic Tortilla Chips', category: 'Snacks', price: 4.95, stock: 35, description: 'Freshly smashed avocado dip with corn tortilla chips' },
  { name: 'Dried Mango Strips 120g', category: 'Snacks', price: 4.00, stock: 45, description: 'Naturally sweet unsweetened Philippine mangoes' },
  { name: 'Dark Chocolate Covered Espresso Beans', category: 'Snacks', price: 3.75, stock: 50, description: 'Roasted Arabica coffee beans in rich dark chocolate' },
  { name: 'Protein Peanut Butter Energy Bites', category: 'Snacks', price: 3.50, stock: 50, description: 'Peanut butter, rolled oats, chia seeds, dark chocolate chips' },
  { name: 'Matcha Almond Protein Bar', category: 'Snacks', price: 3.25, stock: 60, description: '15g plant-based protein bar with ceremonial matcha' },
  { name: 'Chocolate Sea Salt Protein Bar', category: 'Snacks', price: 3.25, stock: 65, description: 'High-protein bar with cocoa nibs and sea salt' },
  { name: 'Wasabi Roasted Green Peas', category: 'Snacks', price: 2.75, stock: 55, description: 'Crunchy green peas with fiery wasabi glaze' },
  { name: 'Sharp Cheddar Cheese & Crackers Box', category: 'Snacks', price: 4.50, stock: 35, description: 'Aged Wisconsin cheddar cubes with artisan crackers' },
  { name: 'Fresh Cut Seasonal Fruit Cup', category: 'Snacks', price: 4.50, stock: 30, description: 'Watermelon, pineapple, grapes, and cantaloupe' },
  { name: 'Spicy Sriracha Cashews', category: 'Snacks', price: 4.50, stock: 40, description: 'Roasted cashews tossed in tangy sriracha spice' },
  { name: 'Organic Coconut Chips', category: 'Snacks', price: 2.95, stock: 50, description: 'Toasted coconut slices with light cane sugar' },
  { name: 'Dark Chocolate Sea Salt Bar 85g', category: 'Snacks', price: 4.25, stock: 60, description: 'Single-origin dark chocolate bar with fleur de sel' },
  { name: 'Roasted Seaweed Crisps (Pack of 3)', category: 'Snacks', price: 2.50, stock: 70, description: 'Lightly roasted nori sheets with sesame oil' },
  { name: 'Gourmet Gummy Bears 150g', category: 'Snacks', price: 2.75, stock: 60, description: 'Real fruit juice gummy bears' },
  { name: 'Beef Jerky Original Smokehouse 80g', category: 'Snacks', price: 5.95, stock: 40, description: '100% prime beef marinated and hardwood smoked' },
  { name: 'Teriyaki Turkey Jerky 80g', category: 'Snacks', price: 5.95, stock: 35, description: 'Lean tender turkey jerky with sweet soy glaze' },
  { name: 'Crispy Apple Chips', category: 'Snacks', price: 2.95, stock: 45, description: 'Baked Fuji apple slices with cinnamon' },
  { name: 'Roasted Chickpeas Sea Salt', category: 'Snacks', price: 2.75, stock: 50, description: 'High fiber crunchy roasted garbanzo beans' },
  { name: 'Organic Almond Butter Squeeze Pack', category: 'Snacks', price: 1.95, stock: 80, description: 'Single-serve creamy roasted almond butter' },

  // ELECTRONICS (25 items)
  { name: 'Wireless Bluetooth Earbuds Pro', category: 'Electronics', price: 49.99, stock: 25, description: 'Active noise cancellation with 24hr battery charging case' },
  { name: 'Fast USB-C to USB-C Cable (6ft)', category: 'Electronics', price: 12.99, stock: 60, description: '100W braided durable power delivery cable' },
  { name: 'USB-C to Lightning Cable (6ft)', category: 'Electronics', price: 14.99, stock: 50, description: 'MFi certified nylon braided charging cable' },
  { name: '20W USB-C PD Compact Wall Charger', category: 'Electronics', price: 18.50, stock: 40, description: 'Ultra-compact fast charging power adapter' },
  { name: '65W GaN Multi-Port Fast Charger', category: 'Electronics', price: 39.99, stock: 25, description: '3-port GaN charger for laptop, tablet, and phone' },
  { name: '10000mAh Slim Power Bank', category: 'Electronics', price: 29.99, stock: 35, description: 'Fast charging dual-output portable battery pack' },
  { name: '20000mAh Heavy Duty Power Bank', category: 'Electronics', price: 45.00, stock: 20, description: 'High capacity battery pack with digital display' },
  { name: 'Magnetic Wireless Charging Pad 15W', category: 'Electronics', price: 24.99, stock: 30, description: 'MagSafe compatible fast wireless charger' },
  { name: 'Waterproof Bluetooth Speaker', category: 'Electronics', price: 34.99, stock: 25, description: 'IPX7 waterproof portable speaker with rich bass' },
  { name: 'Noise-Cancelling Over-Ear Headphones', category: 'Electronics', price: 79.99, stock: 15, description: 'Comfortable memory foam earcups with 35hr playtime' },
  { name: '7-in-1 USB-C Hub Adapter', category: 'Electronics', price: 32.50, stock: 25, description: '4K HDMI, 3x USB 3.0, SD card reader, 100W PD' },
  { name: 'Ergonomic Wireless Optical Mouse', category: 'Electronics', price: 19.99, stock: 40, description: 'Silent click 2.4GHz + Bluetooth rechargeable mouse' },
  { name: 'Slim Wireless Bluetooth Keyboard', category: 'Electronics', price: 29.99, stock: 30, description: 'Rechargeable multi-device compact keyboard' },
  { name: 'Precision Stylus Pen for Touchscreens', category: 'Electronics', price: 21.99, stock: 35, description: 'Fine point capacitive stylus pen with magnetic cap' },
  { name: 'LED Desk Lamp with Wireless Charging Base', category: 'Electronics', price: 38.00, stock: 20, description: 'Dimmable color temperature lamp with 10W wireless charger' },
  { name: 'HD 1080p Streaming Webcam with Mic', category: 'Electronics', price: 36.99, stock: 20, description: 'Autofocus wide angle webcam with privacy shutter' },
  { name: 'Smart Fitness Tracker Band', category: 'Electronics', price: 39.99, stock: 25, description: 'Heart rate, sleep tracking, step counter, waterproof' },
  { name: 'Dual USB Car Charger 36W', category: 'Electronics', price: 13.99, stock: 45, description: 'Fast charging metal car adapter for USB-C & USB-A' },
  { name: 'Smart Plug WiFi Socket (2-Pack)', category: 'Electronics', price: 22.99, stock: 30, description: 'Works with Alexa & Google Home, timer function' },
  { name: 'Magnetic Phone Ring Light', category: 'Electronics', price: 16.99, stock: 40, description: 'Rechargeable selfie ring light for video calls and photos' },
  { name: 'MicroSD Card 128GB High Speed', category: 'Electronics', price: 17.50, stock: 50, description: 'Class 10 U3 100MB/s memory card with adapter' },
  { name: 'USB-C Flash Drive 128GB Dual Drive', category: 'Electronics', price: 21.99, stock: 40, description: 'High speed swivel dual USB-C & USB-A flash drive' },
  { name: 'Bluetooth Audio Transmitter / Receiver', category: 'Electronics', price: 18.99, stock: 30, description: '3.5mm AUX adapter for car, airplane, and home stereo' },
  { name: 'Screen Cleaning Mist & Microfiber Kit', category: 'Electronics', price: 9.99, stock: 70, description: 'Streak-free spray with integrated microfiber shell' },
  { name: 'Cable Management Organizer Box', category: 'Electronics', price: 14.50, stock: 35, description: 'Flame retardant desk cable management box' },

  // ACCESSORIES (25 items)
  { name: 'Magnetic Aluminium Phone Desk Stand', category: 'Accessories', price: 18.50, stock: 45, description: 'Fully foldable 360-degree rotating aluminium desktop stand' },
  { name: 'Adjustable Laptop Riser Stand', category: 'Accessories', price: 26.99, stock: 30, description: 'Ergonomic ventilated aluminum stand for 10-17 inch laptops' },
  { name: 'Slim RFID Blocking Leather Cardholder', category: 'Accessories', price: 22.00, stock: 40, description: 'Genuine leather minimalist wallet with quick pull tab' },
  { name: 'Vacuum Insulated Stainless Steel Bottle 750ml', category: 'Accessories', price: 24.50, stock: 50, description: 'Keeps drinks cold for 24h, hot for 12h, leakproof' },
  { name: 'Ceramic Reusable Coffee Travel Mug 350ml', category: 'Accessories', price: 19.99, stock: 45, description: 'Ceramic lined stainless steel mug with spillproof lid' },
  { name: 'Heavy Duty Organic Cotton Canvas Tote', category: 'Accessories', price: 14.00, stock: 60, description: 'Reinforced handles, interior zipper pocket, 16oz cotton' },
  { name: 'Water-Resistant Laptop Sleeve 13-14 inch', category: 'Accessories', price: 21.50, stock: 35, description: 'Padded protective sleeve with front accessory pocket' },
  { name: 'Water-Resistant Laptop Sleeve 15-16 inch', category: 'Accessories', price: 23.50, stock: 30, description: 'Shockproof soft fleece lining with durable outer shell' },
  { name: 'Leather Key Organizer Keychain', category: 'Accessories', price: 12.99, stock: 50, description: 'Silent compact key holder prevents pocket scratches' },
  { name: 'Polarized Sunglasses Classic Wayfarer', category: 'Accessories', price: 28.00, stock: 30, description: 'UV400 protection with lightweight matte black frame' },
  { name: 'Large Felt Desk Mat Pad (80x30cm)', category: 'Accessories', price: 16.99, stock: 40, description: 'Non-slip wool blend desk protector for keyboard & mouse' },
  { name: 'Compact Automatic Windproof Travel Umbrella', category: 'Accessories', price: 18.99, stock: 35, description: 'Teflon coated fiberglass frame with 1-button auto open' },
  { name: 'Hard Shell Sunglasses Case', category: 'Accessories', price: 8.50, stock: 60, description: 'Crushproof protective case with cleaning cloth' },
  { name: 'Reusable Metal Straw Set with Cleaning Brush', category: 'Accessories', price: 6.99, stock: 75, description: '4 stainless steel straws with carrying velvet pouch' },
  { name: 'Minimalist Matte Metal Gel Pen Set (Pack of 3)', category: 'Accessories', price: 9.50, stock: 60, description: '0.5mm smooth black quick-dry ink pens' },
  { name: 'Insulated Lunch Cooler Bag', category: 'Accessories', price: 19.50, stock: 30, description: 'Thermal leakproof food storage tote with shoulder strap' },
  { name: 'Silicone Reusable Cable Organizer Ties (Pack of 10)', category: 'Accessories', price: 6.50, stock: 80, description: 'Flexible magnetic wire ties for cords and cables' },
  { name: 'Enamel Metal POS Collector Pin', category: 'Accessories', price: 5.00, stock: 90, description: 'Custom enamel pin for backpacks, jackets, and hats' },
  { name: 'Eco Bamboo Fiber Bento Lunch Box', category: 'Accessories', price: 18.00, stock: 35, description: 'BPA-free meal prep container with utensils and sealing band' },
  { name: 'Nylon Braided Luggage Tag Set (2-Pack)', category: 'Accessories', price: 7.99, stock: 60, description: 'Durable aluminum privacy tag with steel loops' },
  { name: 'Microfiber Cleaning Cloths (Pack of 6)', category: 'Accessories', price: 7.50, stock: 80, description: 'Ultra-soft cloths for eyeglasses, cameras, and phone screens' },
  { name: 'Stainless Steel Carabiner Keychain Multi-Tool', category: 'Accessories', price: 11.50, stock: 50, description: 'Bottle opener, hex wrench, and heavy duty carabiner clip' },
  { name: 'Leather Passport Holder & Travel Wallet', category: 'Accessories', price: 16.50, stock: 35, description: 'RFID blocking passport cover with boarding pass slot' },
  { name: 'A5 Hardcover Dotted Grid Notebook', category: 'Accessories', price: 13.50, stock: 45, description: '160 pages 120gsm bleed-proof paper with elastic band' },
  { name: 'Compact Pocket Pill Organizer Case', category: 'Accessories', price: 7.99, stock: 55, description: 'Moisture-proof 8-compartment daily travel medicine box' }
];

async function seed() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pos_system';

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('Connected!');

    console.log('Clearing old products collection...');
    await Product.deleteMany({});

    console.log(`Inserting ${items.length} products into MongoDB database...`);
    const inserted = await Product.insertMany(items);
    console.log(`Successfully inserted ${inserted.length} products into database!`);

    const countByCategory = await Product.aggregate([
      { $group: { _id: '$category', total: { $sum: 1 } } }
    ]);
    console.log('Products per category in database:', countByCategory);

    await mongoose.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error populating database:', err.message);
  }
}

seed();
