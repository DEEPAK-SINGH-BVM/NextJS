import Category  from "../models/categoryModal.js";

export const createCategory = async (req, res) => {
  const { category, subcategories } = req.body;

  try {
    const exists = await Category.findOne({ category });
    if (exists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const newCategory = new Category({ category, subcategories });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = Math.min(parseInt(req.query.perPage) || 25, 100);
    const search = req.query.search || '';
    const skip = (page - 1) * perPage;
    const query = search
      ? { category: { $regex: search, $options: 'i' } }
      : {};
    const totalItems = await Category.countDocuments(query);
    // Sort by updatedAt (latest updated or added first)
    const categories = await Category.find(query)
      .sort({ updatedAt: -1 }) 
      .skip(skip)
      .limit(perPage);
    const totalPages = Math.ceil(totalItems / perPage);
    res.status(200).json({
      page,
      perPage,
      totalPages,
      totalItems,
      categories,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Update a category by ID
export const updateCategory = async (req, res) => {
  const { category, subcategories } = req.body;

  try {
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { category, subcategories },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Delete a category by ID
export const deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
