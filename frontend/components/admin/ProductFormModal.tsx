import React, { useState, useEffect } from "react";
import { Product, ProductAttributes, ProductVariant } from "../../types";
import { CloseIcon, CloudArrowUpIcon, TrashIcon } from "../icons";
import { useAuth } from "../../hooks/useAuth";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    productData: Omit<Product, "id" | "createdAt"> & {
      id?: string | number;
      createdAt?: string;
    },
  ) => void;
  productToEdit: Product | null;
  productAttributes: ProductAttributes;
}

const initialProductState: Omit<Product, "id" | "createdAt"> = {
  name: "",
  price: 0,
  discountPrice: undefined,
  description: "",
  category: "men",
  subCategory: "",
  imageUrls: [],
  sizes: [],
  colors: [],
  material: "",
  featured: false,
  stock: 0,
  variants: [],
};

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
  productAttributes,
}) => {
  const [productData, setProductData] =
    useState<Omit<Product, "id" | "createdAt">>(initialProductState);
  const [errors, setErrors] = useState<{ discountPrice?: string }>({});
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (productToEdit) {
      const { id, createdAt, ...editableData } = productToEdit;
      setProductData({
        ...editableData,
        discountPrice: editableData.discountPrice ?? undefined,
        variants: editableData.variants || [],
      });
    } else {
      setProductData(initialProductState);
    }
    setErrors({});
  }, [productToEdit, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (name === "price" || name === "discountPrice") {
      setErrors({});
    }

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setProductData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setProductData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (field: "colors" | "sizes", value: string) => {
    setProductData((prev) => {
      const currentValues = prev[field];
      if (currentValues.includes(value)) {
        return { ...prev, [field]: currentValues.filter((v) => v !== value) };
      } else {
        return { ...prev, [field]: [...currentValues, value] };
      }
    });
  };

  // Generate variants based on selected sizes and colors
  const generateVariants = () => {
    const newVariants: ProductVariant[] = [];
    productData.colors.forEach((color) => {
      productData.sizes.forEach((size) => {
        // Check if variant already exists to preserve stock
        const existing = productData.variants?.find(
          (v) => v.color === color && v.size === size,
        );
        newVariants.push({
          size,
          color,
          stock: existing ? existing.stock : 0,
        });
      });
    });
    setProductData((prev) => ({ ...prev, variants: newVariants }));
  };

  // Update variants when colors or sizes change (optional, depends on UX preference. Here manual button is safer or useEffect)
  useEffect(() => {
    // Automatically regenerate variants structure when selections change, but try to preserve old stock values
    if (productData.colors.length > 0 && productData.sizes.length > 0) {
      const newVariants: ProductVariant[] = [];
      productData.colors.forEach((color) => {
        productData.sizes.forEach((size) => {
          const existing = productData.variants?.find(
            (v) => v.color === color && v.size === size,
          );
          newVariants.push({
            size,
            color,
            stock: existing ? existing.stock : 0,
          });
        });
      });
      setProductData((prev) => ({ ...prev, variants: newVariants }));
    }
  }, [productData.colors, productData.sizes]);

  const handleVariantStockChange = (index: number, newStock: string) => {
    const stockVal = parseInt(newStock) || 0;
    setProductData((prev) => {
      const updatedVariants = [...(prev.variants || [])];
      if (updatedVariants[index]) {
        updatedVariants[index] = { ...updatedVariants[index], stock: stockVal };
      }
      // Optionally update total stock sum
      const totalStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);
      return { ...prev, variants: updatedVariants, stock: totalStock };
    });
  };

  const getApiUrl = () => {
    try {
      const meta = (import.meta as any) || {};
      const env = meta.env || {};
      return env.VITE_API_URL || "http://localhost:5000/api";
    } catch {
      return "http://localhost:5000/api";
    }
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read image file."));
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    if (!token) {
      alert("Please login again as admin to upload images.");
      e.target.value = "";
      return;
    }

    const files = Array.from(e.target.files);

    const maxFileSizeBytes = 8 * 1024 * 1024;
    const oversizedFile = files.find((file) => file.size > maxFileSizeBytes);
    if (oversizedFile) {
      alert(
        `Image \"${oversizedFile.name}\" is too large. Please upload files smaller than 8MB.`,
      );
      e.target.value = "";
      return;
    }

    const uploadedUrls: string[] = [];
    const apiUrl = getApiUrl();

    setIsUploadingImages(true);

    try {
      for (const file of files) {
        const imageDataUrl = await fileToDataUrl(file);

        const response = await fetch(`${apiUrl}/products/upload-image`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ image: imageDataUrl }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Image upload failed.");
        }

        if (data.imageUrl) {
          uploadedUrls.push(data.imageUrl);
        }
      }

      if (uploadedUrls.length > 0) {
        setProductData((prev) => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...uploadedUrls],
        }));
      }
    } catch (error: any) {
      alert(error?.message || "Failed to upload images to Cloudinary.");
    } finally {
      setIsUploadingImages(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setProductData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const price = Number(productData.price) || 0;
    const discountPrice = productData.discountPrice
      ? Number(productData.discountPrice)
      : undefined;

    if (discountPrice !== undefined && discountPrice >= price) {
      setErrors({
        discountPrice: "Discount price must be less than the original price.",
      });
      return;
    }

    const dataToSave: Omit<Product, "id" | "createdAt"> & {
      id?: string | number;
      createdAt?: string;
    } = {
      ...productData,
      price: price,
      discountPrice: discountPrice,
      stock: Number(productData.stock) || 0,
      featured: !!productData.featured,
    };

    if (productToEdit) {
      dataToSave.id = productToEdit.id;
      dataToSave.createdAt = productToEdit.createdAt;
    }

    onSave(dataToSave);
  };

  if (!isOpen) return null;

  const inputClass =
    "block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-gold focus:border-brand-gold dark:bg-gray-700 dark:border-gray-600 dark:text-white";
  const labelClass =
    "block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-brand-charcoal rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-brand-border flex justify-between items-center sticky top-0 bg-white dark:bg-brand-charcoal z-10">
          <h2
            id="product-modal-title"
            className="text-xl font-serif font-semibold"
          >
            {productToEdit ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <form
          id="product-form"
          onSubmit={handleSubmit}
          className="flex-grow overflow-y-auto p-6 space-y-4"
        >
          <div>
            <label htmlFor="name" className={labelClass}>
              Product Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={productData.name}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Product Images</label>
            <div className="mt-1 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {productData.imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative group aspect-w-1 aspect-h-1"
                >
                  <img
                    src={url}
                    alt={`Product image ${index + 1}`}
                    className="object-cover rounded-md w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="p-2 bg-white/20 rounded-full text-white hover:bg-white/40"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center justify-center w-full h-full aspect-w-1 aspect-h-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <CloudArrowUpIcon className="h-8 w-8 text-gray-400" />
                <span className="mt-2 text-xs text-gray-500 text-center">
                  {isUploadingImages ? "Uploading..." : "Upload Images"}
                </span>
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageUpload}
                  disabled={isUploadingImages}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className={labelClass}>
                Price (Rs.)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={productData.price}
                onChange={handleChange}
                className={inputClass}
                min="0"
                required
              />
            </div>
            <div>
              <label htmlFor="discountPrice" className={labelClass}>
                Discount Price (Rs.){" "}
                <span className="text-xs text-gray-500">(Optional)</span>
              </label>
              <input
                type="number"
                id="discountPrice"
                name="discountPrice"
                value={productData.discountPrice || ""}
                onChange={handleChange}
                className={`${inputClass} ${errors.discountPrice ? "border-red-500" : ""}`}
                placeholder="e.g., 29500"
                min="0"
              />
              {errors.discountPrice && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.discountPrice}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="stock" className={labelClass}>
                Total Stock Quantity
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={productData.stock}
                onChange={handleChange}
                className={inputClass}
                min="0"
                required
                readOnly={
                  productData.variants && productData.variants.length > 0
                }
              />
              {productData.variants && productData.variants.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Calculated from variants below.
                </p>
              )}
            </div>
            <div>
              <label htmlFor="category" className={labelClass}>
                Category
              </label>
              <select
                id="category"
                name="category"
                value={productData.category}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="unisex">Unisex</option>
                <option value="sportswear">Sportswear</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="subCategory" className={labelClass}>
              Sub Category
            </label>
            <select
              id="subCategory"
              name="subCategory"
              value={productData.subCategory}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select a sub-category</option>
              {productAttributes.subCategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="material" className={labelClass}>
              Material
            </label>
            <select
              id="material"
              name="material"
              value={productData.material}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select a material</option>
              {productAttributes.materials.map((mat) => (
                <option key={mat} value={mat}>
                  {mat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={productData.description}
              onChange={handleChange}
              rows={4}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Sizes</label>
            <div className="mt-2 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {productAttributes.sizes.map((size) => (
                <div key={size} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`size-${size}`}
                    checked={productData.sizes.includes(size)}
                    onChange={() => handleCheckboxChange("sizes", size)}
                    className="h-4 w-4 text-brand-gold border-gray-300 rounded focus:ring-brand-gold"
                  />
                  <label
                    htmlFor={`size-${size}`}
                    className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
                  >
                    {size}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Colors</label>
            <div className="mt-2 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {productAttributes.colors.map((color) => (
                <div key={color} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`color-${color}`}
                    checked={productData.colors.includes(color)}
                    onChange={() => handleCheckboxChange("colors", color)}
                    className="h-4 w-4 text-brand-gold border-gray-300 rounded focus:ring-brand-gold"
                  />
                  <label
                    htmlFor={`color-${color}`}
                    className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
                  >
                    {color}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {productData.variants && productData.variants.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Variant Stock Management
              </h3>
              <div className="max-h-60 overflow-y-auto pr-2">
                {productData.variants.map((variant, index) => (
                  <div
                    key={`${variant.color}-${variant.size}`}
                    className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: variant.color.toLowerCase() }}
                      ></span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {variant.color} - {variant.size}
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(e) =>
                        handleVariantStockChange(index, e.target.value)
                      }
                      className="w-24 p-1 text-sm border border-gray-300 rounded focus:ring-brand-gold focus:border-brand-gold dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={productData.featured}
              onChange={handleChange}
              className="h-4 w-4 text-brand-gold border-gray-300 rounded focus:ring-brand-gold"
            />
            <label
              htmlFor="featured"
              className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
            >
              Featured Product (Show on homepage)
            </label>
          </div>
        </form>
        <div className="p-6 flex justify-end space-x-3 border-t border-gray-200 dark:border-brand-border sticky bottom-0 bg-white dark:bg-brand-charcoal z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-gold hover:bg-yellow-600"
          >
            Save Product
          </button>
        </div>
      </div>
    </div>
  );
};
