import Category from "../models/Category.js";

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    res
      .status(500)
      .json({ message: "فشل في إنشاء التصنيف", error: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "فشل في جلب التصنيفات", error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "تم حذف التصنيف بنجاح" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "فشل في حذف التصنيف", error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ message: "التصنيف غير موجود" });
    }
    res.json(category);
  } catch (error) {
    res
      .status(500)
      .json({ message: "فشل في تعديل التصنيف", error: error.message });
  }
};
