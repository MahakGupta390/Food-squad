const m = (id, name, price, category, veg, desc) => ({ id, name, price, category, veg, desc });

export const RESTAURANTS = [
  {
    slug: 'bbq-nation', name: 'Barbeque Nation', tagline: 'Smoky Kebabs, Tandoori Platters & North Indian Classics',
    cuisine: 'North Indian, Tandoor', rating: 4.8, reviews: 1420, deliveryTime: '30-40 min', priceForTwo: 800,
    dietary: 'Veg & Non-Veg', code: 'BBQ-4821',
    menu: [
      m('bbq-1', 'Paneer Tikka', 329, 'Starters', true, 'Cottage cheese marinated in tandoori spices and char-grilled with peppers.'),
      m('bbq-2', 'Chicken Seekh Kebab', 379, 'Starters', false, 'Minced chicken blended with herbs, garlic, and roasted over slow embers.'),
      m('bbq-3', 'Dal Makhani', 299, 'Mains', true, 'Slow-simmered black lentils with cream, butter, and mild aromatic spices.'),
      m('bbq-4', 'Butter Naan', 59, 'Breads', true, 'Crisp, leavened bread brushed generously with churned butter.'),
      m('bbq-5', 'Gulab Jamun', 149, 'Desserts', true, 'Soft khoya dumplings soaked in saffron-infused warm cardamom syrup.'),
      m('bbq-6', 'Veg Biryani', 289, 'Mains', true, 'Aromatic basmati rice layered with garden vegetables and saffron.'),
      m('bbq-7', 'Mango Lassi', 119, 'Beverages', true, 'Thick, chilled sweet yogurt blended with Alphonso mango pulp.'),
      m('bbq-8', 'Mutton Seekh Kebab', 429, 'Starters', false, 'Spiced tender minced lamb kebabs with mint chutney glaze.'),
      m('bbq-9', 'Tandoori Roti', 39, 'Breads', true, 'Whole wheat flatbread baked in traditional clay oven.'),
    ],
  },
  {
    slug: 'haldirams', name: "Haldiram's Express", tagline: 'Authentic Street Food, Traditional Chaats & Royal Sweets',
    cuisine: 'North Indian, Street Food', rating: 4.6, reviews: 2180, deliveryTime: '25-35 min', priceForTwo: 450,
    dietary: '100% Pure Veg', code: 'HLD-9102',
    menu: [
      m('hld-1', 'Special Raj Kachori', 180, 'Starters', true, 'Crisp giant sphere stuffed with potatoes, sprouts, sweetened curd, and chutneys.'),
      m('hld-2', 'Amritsari Chole Bhature', 240, 'Mains', true, 'Spiced chickpea curry paired with two fluffy, golden fried bhaturas.'),
      m('hld-3', 'Paneer Butter Masala', 310, 'Mains', true, 'Cubes of fresh paneer in a velvety tomato and cashew nut gravy.'),
      m('hld-4', 'Tandoori Platter (Veg)', 360, 'Starters', true, 'Assortment of malai chaap, paneer tikka, and tandoori mushroom.'),
      m('hld-5', 'Kesar Rasmalai (2 pcs)', 130, 'Desserts', true, 'Flattened cottage cheese patties soaked in saffron clotted milk.'),
      m('hld-6', 'Garlic Butter Naan', 65, 'Breads', true, 'Clay-oven naan topped with minced roasted garlic and fresh coriander.'),
      m('hld-7', 'Deluxe Executive Thali', 390, 'Mains', true, 'Paneer dish, dal, dry vegetable, rice, 2 rotis, raita, sweet, and papad.'),
    ],
  },
  {
    slug: 'biryani-blues', name: 'Biryani Blues', tagline: 'Hyderabadi Dum Biryanis Cooked in Handis & Spiced Starters',
    cuisine: 'Biryani, Mughlai', rating: 4.7, reviews: 950, deliveryTime: '30-40 min', priceForTwo: 600,
    dietary: 'Veg & Non-Veg', code: 'BLU-3329',
    menu: [
      m('blu-1', 'Hyderabadi Chicken Biryani', 365, 'Mains', false, 'Fragrant long-grain rice and tender chicken sealed and dum-cooked with herbs.'),
      m('blu-2', 'Dum Paneer Biryani', 315, 'Mains', true, 'Marinated paneer cubes layered with saffron rice and fried onions.'),
      m('blu-3', 'Fiery Chicken 65', 295, 'Starters', false, 'Crispy fried chicken tossed with curry leaves and spicy green chilies.'),
      m('blu-4', 'Galouti Kebab', 345, 'Starters', false, 'Melt-in-the-mouth Awadhi spiced kebabs served with soft ulta tawa paratha.'),
      m('blu-5', 'Mirchi Ka Salan & Raita', 85, 'Breads', true, 'Traditional Hyderabadi peanut-sesame pepper curry and cooling curd dip.'),
      m('blu-6', 'Shahi Phirni', 120, 'Desserts', true, 'Chilled ground rice pudding flavored with cardamom, saffron, and pistachios.'),
    ],
  },
  {
    slug: 'pizza-hut', name: 'Pizza Hut', tagline: 'Handcrafted Pan Pizzas, Garlic Bread & Melts',
    cuisine: 'Italian, Pizza', rating: 4.5, reviews: 1840, deliveryTime: '30-40 min', priceForTwo: 650,
    dietary: 'Veg & Non-Veg', code: 'PZT-7741',
    menu: [
      m('pzt-1', 'Margherita Classico Pan', 299, 'Mains', true, 'Classic pan crust layered with signature herb sauce and 100% mozzarella.'),
      m('pzt-2', 'Smokey Chicken Feast', 449, 'Mains', false, 'Loaded with BBQ chicken, chicken sausage, peri peri drizzle, and cheese.'),
      m('pzt-3', 'Garlic Bread with Cheese Dip', 169, 'Starters', true, 'Toasted buttery baguette with garlic herb butter and warm cheddar dip.'),
      m('pzt-4', 'Veggie Supreme Pan', 389, 'Mains', true, 'Black olives, crisp bell peppers, sweet corn, mushrooms, and mozzarella.'),
      m('pzt-5', 'Choco Volcano Lava Cake', 129, 'Desserts', true, 'Warm chocolate cake with a molten Belgian fudge center.'),
    ],
  },
  {
    slug: 'subway', name: 'Subway', tagline: 'Freshly Baked Artisan Breads, Crisp Veggies & Protein Bowls',
    cuisine: 'Healthy, Sandwiches', rating: 4.6, reviews: 820, deliveryTime: '20-30 min', priceForTwo: 400,
    dietary: 'Veg & Non-Veg', code: 'SUB-1084',
    menu: [
      m('sub-1', 'Paneer Tikka Sub (6 inch)', 240, 'Mains', true, 'Roasted paneer cubes tossed in tandoori seasoning with crunchy salad.'),
      m('sub-2', 'Roasted Chicken Breast Sub', 270, 'Mains', false, 'Succulent chicken breast slices with honey mustard and fresh greens.'),
      m('sub-3', 'Veggie Delite Protein Bowl', 210, 'Mains', true, 'Double crunch veggies, pickled jalapenos, olives, and olive oil vinaigrette.'),
      m('sub-4', 'Dark Chocolate Chunk Cookie', 75, 'Desserts', true, 'Warm chewy freshly baked cookie with rich dark chocolate chunks.'),
      m('sub-5', 'Iced Peach Lemonade', 95, 'Beverages', true, 'Refreshing brewed iced beverage infused with natural peach essence.'),
    ],
  },
  {
    slug: 'burma-burma', name: 'Burma Burma', tagline: 'Artisanal Burmese Bowls, Lotus Crisps & Specialty Teas',
    cuisine: 'Pan-Asian, Burmese', rating: 4.9, reviews: 640, deliveryTime: '40-50 min', priceForTwo: 900,
    dietary: '100% Pure Veg', code: 'BRM-5512',
    menu: [
      m('brm-1', 'Burma Burma Oh No Khowsuey', 420, 'Mains', true, 'Coconut milk curry served with noodles and 8 traditional crunchy toppings.'),
      m('brm-2', 'Crispy Lotus Stem in Honey Chili', 320, 'Starters', true, 'Thin lotus root crisps glazed with smoked chili paste and toasted sesame.'),
      m('brm-3', 'Mandalay Tea Leaf Salad', 360, 'Starters', true, 'Fermented Burmese tea leaves tossed with roasted nuts, garlic chips, and tomatoes.'),
      m('brm-4', 'Steamed Truffle Mushroom Buns', 340, 'Starters', true, 'Fluffy steamed bao filled with seasoned wild mushrooms and truffle oil.'),
      m('brm-5', 'Smoked Guava Blossom Cooler', 210, 'Beverages', true, 'Chilled guava nectar infused with pink salt and roasted cumin smoke.'),
    ],
  },
];
