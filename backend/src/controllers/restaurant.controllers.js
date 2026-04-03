import { Restaurant } from "../models/restaurant.models.js";

const createRestaurant = async (req, res) => {
    try {
        const existing = await Restaurant.findOne({ name: req.body.name });

        if (existing) {
            return res.status(400).json({ message: "Restaurant already exists" });
        }

        const restaurant = new Restaurant(req.body);
        await restaurant.save();

        res.status(201).json(restaurant);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating restaurant" });
    }
};

// GET all restaurants
const getRestaurants = async (req, res) => {
  try {
    // 1️⃣ Pagination
    console.log("👉 QUERY RECEIVED:", req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    // 2️⃣ Filtering + Search
    const filter = {};

    // if (req.query.city) {
    //  filter.city = { $regex: `^${req.query.city}$`, $options: "i" };
    // }

    // if (req.query.cuisine) {
    //   filter.cuisines = { $regex: req.query.cuisine, $options: "i" };
    // }

   if (req.query.searchTerm) {
  const term = req.query.searchTerm;

  filter = {
    $or: [
      { name: { $regex: term, $options: "i" } },
      { city: { $regex: term, $options: "i" } },
      { cuisines: { $elemMatch: { $regex: term, $options: "i" } } }
    ]
  };
}
  //     filter.$and = [
  //   filter,
  //   {
  //     $or: [
  //       { name: { $regex: req.query.searchTerm, $options: "i" } },
  //       { city: { $regex: req.query.searchTerm, $options: "i" } },
  //       { cuisines: { $regex: req.query.searchTerm, $options: "i" } }
  //     ]
  //   }
  // ];
    // }

    if (req.query.maxDeliveryTime) {
      filter.deliveryTime = { $lte: Number(req.query.maxDeliveryTime) };
    }

    if (req.query.maxPrice) {
      filter.deliveryPrice = { $lte: Number(req.query.maxPrice) };
    }

    // 3️⃣ Sorting
    let sort = {};
    if (req.query.sortBy) {
      const [field, order] = req.query.sortBy.split(":");
      sort[field] = order === "desc" ? -1 : 1;
    }

    // 4️⃣ Get total count (IMPORTANT for frontend pagination)
    const total = await Restaurant.countDocuments(filter);

    // 5️⃣ Fetch paginated data
    const restaurants = await Restaurant.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // 6️⃣ Send response (better than blog)
    res.json({
      data: restaurants,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalItems: total
    });

  } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching restaurants" });
    }
};

// GET single restaurant
const getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        res.json(restaurant);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching restaurant" });
    }
};

export { createRestaurant, getRestaurants, getRestaurantById };