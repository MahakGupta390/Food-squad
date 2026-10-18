const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const restaurants = [
  {
    id: 'bbq-nation',
    name: 'Barbeque Nation',
    tagline: 'Smoky Kebabs, Tandoori Platters & North Indian Classics',
    cuisine: 'North Indian, Tandoor',
    rating: 4.8,
    reviews: 1420,
    deliveryTime: '30-40 min',
    priceForTwo: 800,
    dietary: 'Veg & Non-Veg',
    code: 'BBQ-4821',
    menu: [
      { id: 'bbq-1', name: 'Paneer Tikka', price: 329, category: 'Starters', veg: true, desc: 'Cottage cheese marinated in tandoori spices and char-grilled with peppers.' },
      { id: 'bbq-2', name: 'Chicken Seekh Kebab', price: 379, category: 'Starters', veg: false, desc: 'Minced chicken blended with herbs, garlic, and roasted over slow embers.' },
      { id: 'bbq-3', name: 'Dal Makhani', price: 299, category: 'Mains', veg: true, desc: 'Slow-simmered black lentils with cream, butter, and mild aromatic spices.' },
      { id: 'bbq-4', name: 'Butter Naan', price: 59, category: 'Breads', veg: true, desc: 'Crisp, leavened bread brushed generously with churned butter.' },
      { id: 'bbq-5', name: 'Gulab Jamun', price: 149, category: 'Desserts', veg: true, desc: 'Soft khoya dumplings soaked in saffron-infused warm cardamom syrup.' },
      { id: 'bbq-6', name: 'Veg Biryani', price: 289, category: 'Mains', veg: true, desc: 'Aromatic basmati rice layered with garden vegetables and saffron.' },
      { id: 'bbq-7', name: 'Mango Lassi', price: 119, category: 'Beverages', veg: true, desc: 'Thick, chilled sweet yogurt blended with Alphonso mango pulp.' },
      { id: 'bbq-8', name: 'Mutton Seekh Kebab', price: 429, category: 'Starters', veg: false, desc: 'Spiced tender minced lamb kebabs with mint chutney glaze.' },
      { id: 'bbq-9', name: 'Tandoori Roti', price: 39, category: 'Breads', veg: true, desc: 'Whole wheat flatbread baked in traditional clay oven.' }
    ]
  },
  {
    id: 'haldirams',
    name: "Haldiram's Express",
    tagline: 'Authentic Street Food, Traditional Chaats & Royal Sweets',
    cuisine: 'North Indian, Street Food',
    rating: 4.6,
    reviews: 2180,
    deliveryTime: '25-35 min',
    priceForTwo: 450,
    dietary: '100% Pure Veg',
    code: 'HLD-9102',
    menu: [
      { id: 'hld-1', name: 'Special Raj Kachori', price: 180, category: 'Starters', veg: true, desc: 'Crisp giant sphere stuffed with potatoes, sprouts, sweetened curd, and chutneys.' },
      { id: 'hld-2', name: 'Amritsari Chole Bhature', price: 240, category: 'Mains', veg: true, desc: 'Spiced chickpea curry paired with two fluffy, golden fried bhaturas.' },
      { id: 'hld-3', name: 'Paneer Butter Masala', price: 310, category: 'Mains', veg: true, desc: 'Cubes of fresh paneer in a velvety tomato and cashew nut gravy.' },
      { id: 'hld-4', name: 'Tandoori Platter (Veg)', price: 360, category: 'Starters', veg: true, desc: 'Assortment of malai chaap, paneer tikka, and tandoori mushroom.' },
      { id: 'hld-5', name: 'Kesar Rasmalai (2 pcs)', price: 130, category: 'Desserts', veg: true, desc: 'Flattened cottage cheese patties soaked in saffron clotted milk.' },
      { id: 'hld-6', name: 'Garlic Butter Naan', price: 65, category: 'Breads', veg: true, desc: 'Clay-oven naan topped with minced roasted garlic and fresh coriander.' },
      { id: 'hld-7', name: 'Deluxe Executive Thali', price: 390, category: 'Mains', veg: true, desc: 'Paneer dish, dal, dry vegetable, rice, 2 rotis, raita, sweet, and papad.' }
    ]
  },
  {
    id: 'biryani-blues',
    name: 'Biryani Blues',
    tagline: 'Hyderabadi Dum Biryanis Cooked in Handis & Spiced Starters',
    cuisine: 'Biryani, Mughlai',
    rating: 4.7,
    reviews: 950,
    deliveryTime: '30-40 min',
    priceForTwo: 600,
    dietary: 'Veg & Non-Veg',
    code: 'BLU-3329',
    menu: [
      { id: 'blu-1', name: 'Hyderabadi Chicken Biryani', price: 365, category: 'Mains', veg: false, desc: 'Fragrant long-grain rice and tender chicken sealed and dum-cooked with herbs.' },
      { id: 'blu-2', name: 'Dum Paneer Biryani', price: 315, category: 'Mains', veg: true, desc: 'Marinated paneer cubes layered with saffron rice and fried onions.' },
      { id: 'blu-3', name: 'Fiery Chicken 65', price: 295, category: 'Starters', veg: false, desc: 'Crispy fried chicken tossed with curry leaves and spicy green chilies.' },
      { id: 'blu-4', name: 'Galouti Kebab', price: 345, category: 'Starters', veg: false, desc: 'Melt-in-the-mouth Awadhi spiced kebabs served with soft ulta tawa paratha.' },
      { id: 'blu-5', name: 'Mirchi Ka Salan & Raita', price: 85, category: 'Breads', veg: true, desc: 'Traditional Hyderabadi peanut-sesame pepper curry and cooling curd dip.' },
      { id: 'blu-6', name: 'Shahi Phirni', price: 120, category: 'Desserts', veg: true, desc: 'Chilled ground rice pudding flavored with cardamom, saffron, and pistachios.' }
    ]
  },
  {
    id: 'pizza-hut',
    name: 'Pizza Hut',
    tagline: 'Handcrafted Pan Pizzas, Garlic Bread & Melts',
    cuisine: 'Italian, Pizza',
    rating: 4.5,
    reviews: 1840,
    deliveryTime: '30-40 min',
    priceForTwo: 650,
    dietary: 'Veg & Non-Veg',
    code: 'PZT-7741',
    menu: [
      { id: 'pzt-1', name: 'Margherita Classico Pan', price: 299, category: 'Mains', veg: true, desc: 'Classic pan crust layered with signature herb sauce and 100% mozzarella.' },
      { id: 'pzt-2', name: 'Smokey Chicken Feast', price: 449, category: 'Mains', veg: false, desc: 'Loaded with BBQ chicken, chicken sausage, peri peri drizzle, and cheese.' },
      { id: 'pzt-3', name: 'Garlic Bread with Cheese Dip', price: 169, category: 'Starters', veg: true, desc: 'Toasted buttery baguette with garlic herb butter and warm cheddar dip.' },
      { id: 'pzt-4', name: 'Veggie Supreme Pan', price: 389, category: 'Mains', veg: true, desc: 'Black olives, crisp bell peppers, sweet corn, mushrooms, and mozzarella.' },
      { id: 'pzt-5', name: 'Choco Volcano Lava Cake', price: 129, category: 'Desserts', veg: true, desc: 'Warm chocolate cake with a molten Belgian fudge center.' }
    ]
  },
  {
    id: 'subway',
    name: 'Subway',
    tagline: 'Freshly Baked Artisan Breads, Crisp Veggies & Protein Bowls',
    cuisine: 'Healthy, Sandwiches',
    rating: 4.6,
    reviews: 820,
    deliveryTime: '20-30 min',
    priceForTwo: 400,
    dietary: 'Veg & Non-Veg',
    code: 'SUB-1084',
    menu: [
      { id: 'sub-1', name: 'Paneer Tikka Sub (6 inch)', price: 240, category: 'Mains', veg: true, desc: 'Roasted paneer cubes tossed in tandoori seasoning with crunchy salad.' },
      { id: 'sub-2', name: 'Roasted Chicken Breast Sub', price: 270, category: 'Mains', veg: false, desc: 'Succulent chicken breast slices with honey mustard and fresh greens.' },
      { id: 'sub-3', name: 'Veggie Delite Protein Bowl', price: 210, category: 'Mains', veg: true, desc: 'Double crunch veggies, pickled jalapenos, olives, and olive oil vinaigrette.' },
      { id: 'sub-4', name: 'Dark Chocolate Chunk Cookie', price: 75, category: 'Desserts', veg: true, desc: 'Warm chewy freshly baked cookie with rich dark chocolate chunks.' },
      { id: 'sub-5', name: 'Iced Peach Lemonade', price: 95, category: 'Beverages', veg: true, desc: 'Refreshing brewed iced beverage infused with natural peach essence.' }
    ]
  },
  {
    id: 'burma-burma',
    name: 'Burma Burma',
    tagline: 'Artisanal Burmese Bowls, Lotus Crisps & Specialty Teas',
    cuisine: 'Pan-Asian, Burmese',
    rating: 4.9,
    reviews: 640,
    deliveryTime: '40-50 min',
    priceForTwo: 900,
    dietary: '100% Pure Veg',
    code: 'BRM-5512',
    menu: [
      { id: 'brm-1', name: 'Burma Burma Oh No Khowsuey', price: 420, category: 'Mains', veg: true, desc: 'Coconut milk curry served with noodles and 8 traditional crunchy toppings.' },
      { id: 'brm-2', name: 'Crispy Lotus Stem in Honey Chili', price: 320, category: 'Starters', veg: true, desc: 'Thin lotus root crisps glazed with smoked chili paste and toasted sesame.' },
      { id: 'brm-3', name: 'Mandalay Tea Leaf Salad', price: 360, category: 'Starters', veg: true, desc: 'Fermented Burmese tea leaves tossed with roasted nuts, garlic chips, and tomatoes.' },
      { id: 'brm-4', name: 'Steamed Truffle Mushroom Buns', price: 340, category: 'Starters', veg: true, desc: 'Fluffy steamed bao filled with seasoned wild mushrooms and truffle oil.' },
      { id: 'brm-5', name: 'Smoked Guava Blossom Cooler', price: 210, category: 'Beverages', veg: true, desc: 'Chilled guava nectar infused with pink salt and roasted cumin smoke.' }
    ]
  }
];

let selectedRestaurantId = 'bbq-nation';

const members = [
  { id: 'M', name: 'Mahak', budget: 450, ready: true, diet: ['Veg'], mood: 'Spicy' },
  { id: 'A', name: 'Aman', budget: 500, ready: true, diet: ['Non-veg'], mood: 'Comfort food' },
  { id: 'R', name: 'Riya', budget: 400, ready: true, diet: ['Veg', 'Egg-free'], mood: 'Light' },
  { id: 'K', name: 'Kabir', budget: 400, ready: false, diet: ['Veg'], mood: 'Comfort food' },
  { id: 'S', name: 'Sneha', budget: 450, ready: true, diet: ['Non-veg'], mood: 'Sweet tooth' },
];

let cart = [
  { name: 'Paneer Tikka', price: 329, qty: 1, eaters: ['M', 'R', 'K'] },
  { name: 'Chicken Seekh Kebab', price: 379, qty: 1, eaters: ['A', 'S'] },
  { name: 'Dal Makhani', price: 299, qty: 1, eaters: ['M', 'A', 'R', 'K', 'S'] },
  { name: 'Butter Naan', price: 59, qty: 5, eaters: ['M', 'A', 'R', 'K', 'S'] },
  { name: 'Gulab Jamun', price: 149, qty: 2, eaters: ['M', 'S'] },
];

const paid = {};
let placed = false;

const dashboard = {
  owed: 310,
  owe: 240,
  ledger: [
    { id: 'l1', text: 'Aman owes you', amt: 180, member: 'A', settled: false },
    { id: 'l2', text: 'Riya owes you', amt: 130, member: 'R', settled: false },
    { id: 'l3', text: 'You owe Kabir', amt: 240, member: 'K', settled: false }
  ],
  rooms: [
    { id: 'r1', name: 'Barbeque Nation', note: 'You are hosting, 5 members, choosing items', host: true, restId: 'bbq-nation', membersCount: 5, step: 'cart' },
    { id: 'r2', name: "Haldiram's", note: 'Hosted by Sneha, 3 members, waiting for preferences', host: false, restId: 'haldirams', membersCount: 3, step: 'room' },
  ],
  past: [
    { id: 'p1', name: 'Pizza Hut', meta: '11 October · 4 people', amt: 412, settled: true, items: ['Margherita Classico', 'Garlic Breadsticks'] },
    { id: 'p2', name: 'Wow! Momo', meta: '4 October · 3 people', amt: 286, settled: true, items: ['Veg Darjeeling Momo', 'Paneer Fried Momo'] },
    { id: 'p3', name: 'Biryani Blues', meta: '27 September · 5 people', amt: 540, settled: false, items: ['Hyderabadi Chicken Biryani', 'Fiery Chicken 65'] },
  ],
};

function getCurrentRestaurant() {
  return restaurants.find((r) => r.id === selectedRestaurantId) || restaurants[0];
}

function calc() {
  const sub = cart.reduce((a, c) => a + c.price * c.qty, 0);
  const tax = Math.round(sub * 0.05);
  const fee = sub ? 50 : 0;
  const disc = sub ? 100 : 0;
  const total = Math.max(0, sub + tax + fee - disc);
  const ratio = sub ? total / sub : 0;
  const raw = {};
  const shares = {};

  members.forEach((m) => (raw[m.id] = 0));
  cart.forEach((c) => {
    if (c.eaters && c.eaters.length > 0) {
      c.eaters.forEach((id) => {
        if (raw[id] !== undefined) {
          raw[id] += (c.price * c.qty) / c.eaters.length;
        }
      });
    }
  });

  let others = 0;
  members.slice(1).forEach((m) => {
    shares[m.id] = Math.round((raw[m.id] || 0) * ratio);
    others += shares[m.id];
  });
  shares.M = Math.max(0, total - others);

  return { sub, tax, fee, disc, total, shares, raw, ratio };
}

const snapshot = () => {
  const currRest = getCurrentRestaurant();
  return {
    restaurants,
    currentRestaurant: currRest,
    selectedRestaurantId,
    members,
    menu: currRest.menu,
    cart,
    paid,
    placed,
    dashboard,
    calc: calc(),
  };
};

app.get('/api/state', (_, res) => res.json(snapshot()));

app.post('/api/restaurant/select', (req, res) => {
  const { id } = req.body;
  const target = restaurants.find((r) => r.id === id);
  if (target) {
    selectedRestaurantId = target.id;
    // Update active room host details
    dashboard.rooms[0].name = target.name;
    dashboard.rooms[0].restId = target.id;
    dashboard.rooms[0].note = `You are hosting, 5 members, ordering from ${target.name}`;
    // If cart items are from previous restaurant and empty or switched, reset cart with representative items
    if (cart.length > 0) {
      const firstItem = target.menu[0];
      const secondItem = target.menu[1] || target.menu[0];
      const thirdItem = target.menu[2] || target.menu[0];
      cart = [
        { name: firstItem.name, price: firstItem.price, qty: 1, eaters: ['M', 'R', 'K'] },
        { name: secondItem.name, price: secondItem.price, qty: 1, eaters: ['A', 'S'] },
        { name: thirdItem.name, price: thirdItem.price, qty: 1, eaters: ['M', 'A', 'R', 'K', 'S'] },
      ];
    }
  }
  res.json(snapshot());
});

app.post('/api/prefs', (req, res) => {
  const { budget, diet, mood } = req.body;
  const me = members[0];
  if (Number.isFinite(budget)) me.budget = Math.min(1000, Math.max(200, budget));
  if (Array.isArray(diet)) me.diet = diet;
  if (mood) me.mood = mood;
  me.ready = true;
  res.json(snapshot());
});

app.post('/api/cart/add', (req, res) => {
  const currRest = getCurrentRestaurant();
  const line = cart.find((c) => c.name === req.body.name);
  const item = currRest.menu.find((m) => m.name === req.body.name);
  if (line) {
    line.qty++;
  } else if (item) {
    cart.push({ name: item.name, price: item.price, qty: 1, eaters: ['M'] });
  }
  res.json(snapshot());
});

app.post('/api/cart/qty', (req, res) => {
  const { index, delta } = req.body;
  if (cart[index]) {
    cart[index].qty += delta;
    if (cart[index].qty < 1) cart.splice(index, 1);
  }
  res.json(snapshot());
});

app.post('/api/cart/eat', (req, res) => {
  const { index, member } = req.body;
  const e = cart[index]?.eaters;
  if (e) {
    const i = e.indexOf(member);
    if (i > -1) {
      if (e.length > 1) e.splice(i, 1);
    } else {
      e.push(member);
    }
  }
  res.json(snapshot());
});

app.post('/api/order/place', (_, res) => {
  if (cart.length) placed = true;
  res.json(snapshot());
});

app.post('/api/paid', (req, res) => {
  const { id } = req.body;
  paid[id] = true;
  // If Aman or Riya paid, adjust ledger
  const ledgerItem = dashboard.ledger.find((l) => l.member === id);
  if (ledgerItem) {
    ledgerItem.settled = true;
    dashboard.owed = Math.max(0, dashboard.owed - ledgerItem.amt);
  }
  res.json(snapshot());
});

app.post('/api/ledger/settle', (req, res) => {
  const { id } = req.body;
  const ledgerItem = dashboard.ledger.find((l) => l.id === id);
  if (ledgerItem && !ledgerItem.settled) {
    ledgerItem.settled = true;
    if (ledgerItem.text.includes('owes you')) {
      dashboard.owed = Math.max(0, dashboard.owed - ledgerItem.amt);
      if (ledgerItem.member) paid[ledgerItem.member] = true;
    } else {
      dashboard.owe = Math.max(0, dashboard.owe - ledgerItem.amt);
    }
  }
  res.json(snapshot());
});

app.post('/api/order/reset', (_, res) => {
  placed = false;
  Object.keys(paid).forEach((k) => delete paid[k]);
  res.json(snapshot());
});

app.listen(4000, () => console.log('FoodSquad API running on http://localhost:4000'));

