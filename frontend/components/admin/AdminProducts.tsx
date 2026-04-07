import React, { useState, useEffect, useRef } from "react";
import { Product, ProductAttributes } from "../../types";
import { PencilIcon, TrashIcon, PlusIcon } from "../icons";
import { ProductFormModal } from "./ProductFormModal";
import { ConfirmationModal } from "../ConfirmationModal";
import { NotificationType } from "../Notification";
import { api } from "../../api";

interface AdminProductsProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addNotification: (message: string, type: NotificationType) => void;
  productAttributes: ProductAttributes;
}

const StockBadge: React.FC<{ stock: number }> = ({ stock }) => {
  if (stock === 0) {
    return (
      <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 rounded-full animate-pulse border border-red-500/20">
        Out of Stock
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-gold bg-brand-gold/10 rounded-full border border-brand-gold/20">
        Low Stock
      </span>
    );
  }
  return <span className="text-zinc-400 font-bold">{stock}</span>;
};

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  setProducts,
  addNotification,
  productAttributes,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState(
    new Set<string | number>(),
  );
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "single" | "bulk";
    id?: string | number;
  } | null>(null);

  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    if (headerCheckboxRef.current) {
      const allVisibleSelected =
        filteredProducts.length > 0 &&
        selectedProductIds.size === filteredProducts.length;
      headerCheckboxRef.current.checked = allVisibleSelected;
      headerCheckboxRef.current.indeterminate =
        selectedProductIds.size > 0 &&
        selectedProductIds.size < filteredProducts.length;
    }
  }, [selectedProductIds, filteredProducts]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(new Set(filteredProducts.map((p) => p.id)));
    } else {
      setSelectedProductIds(new Set());
    }
  };

  const handleSelectOne = (productId: string | number) => {
    const newSelection = new Set(selectedProductIds);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProductIds(newSelection);
  };

  const handleAddProduct = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (productId: string | number) => {
    setDeleteTarget({ type: "single", id: productId });
  };

  const handleBulkDeleteRequest = () => {
    setDeleteTarget({ type: "bulk" });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === "single" && deleteTarget.id) {
        await api.deleteProduct(deleteTarget.id);
        setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        addNotification("Product successfully deleted.", "success");
      } else if (deleteTarget.type === "bulk") {
        const count = selectedProductIds.size;
        for (const id of selectedProductIds) {
          await api.deleteProduct(id);
        }
        setProducts((prev) =>
          prev.filter((p) => !selectedProductIds.has(p.id)),
        );
        setSelectedProductIds(new Set());
        addNotification(
          `${count} product${count > 1 ? "s" : ""} successfully deleted.`,
          "success",
        );
      }
      setDeleteTarget(null);
    } catch (error: any) {
      addNotification(error?.message || "Failed to delete product.", "error");
    }
  };

  const handleSaveProduct = async (
    productData: Omit<Product, "id" | "createdAt"> & {
      id?: string | number;
      createdAt?: string;
    },
  ) => {
    const isEditing = !!productData.id;

    try {
      let savedProduct: Product;

      if (isEditing) {
        // Update existing product
        const { id, createdAt, ...updateData } = productData;
        savedProduct = await api.updateProduct(id!, updateData);
        setProducts((prev) =>
          prev.map((p) => (p.id === savedProduct.id ? savedProduct : p)),
        );
      } else {
        // Create new product
        const { id, createdAt, ...createData } = productData;
        savedProduct = await api.createProduct(createData);
        setProducts((prev) => [savedProduct, ...prev]);
      }

      setIsModalOpen(false);
      addNotification(
        `Product successfully ${isEditing ? "updated" : "created"}.`,
        "success",
      );
    } catch (error: any) {
      addNotification(
        error?.message ||
          `Failed to ${isEditing ? "update" : "create"} product.`,
        "error",
      );
    }
  };

  const toggleFeatured = async (productId: string | number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    try {
      const updatedProduct = await api.updateProduct(productId, {
        featured: !product.featured,
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? updatedProduct : p)),
      );
    } catch (error: any) {
      addNotification(error?.message || "Failed to update product.", "error");
    }
  };

  const handleBulkSetFeatured = async (featured: boolean) => {
    try {
      const count = selectedProductIds.size;
      for (const id of selectedProductIds) {
        await api.updateProduct(id, { featured });
      }
      setProducts((prev) =>
        prev.map((p) =>
          selectedProductIds.has(p.id) ? { ...p, featured } : p,
        ),
      );
      setSelectedProductIds(new Set());
      addNotification(
        `${count} product${count > 1 ? "s" : ""} ${featured ? "set as featured" : "removed from featured"}.`,
        "info",
      );
    } catch (error: any) {
      addNotification(error?.message || "Failed to update products.", "error");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="relative group w-full sm:w-96">
          <div className="flex items-center glass-panel rounded-2xl px-4 py-2.5 group-focus-within:ring-2 ring-brand-gold/30 transition-luxury bg-white/5">
            <PlusIcon className="h-5 w-5 text-zinc-500 group-focus-within:text-brand-gold transition-colors rotate-45" />
            <input
              type="text"
              placeholder="Find unique pieces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ml-3 bg-transparent border-none text-sm text-white placeholder-zinc-400 focus:outline-none w-full"
            />
          </div>
        </div>

        <button
          onClick={handleAddProduct}
          className="flex items-center justify-center gap-2 bg-gradient-gold text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-luxury glow-gold whitespace-nowrap uppercase tracking-widest text-xs"
        >
          <PlusIcon className="h-4 w-4" />
          Archive New Product
        </button>
      </div>

      {/* Products Table */}
      <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl -z-10"></div>

        {selectedProductIds.size > 0 && (
          <div className="p-4 bg-brand-gold/10 border-b border-brand-gold/20 flex flex-wrap items-center gap-6 animate-in slide-in-from-top duration-500">
            <p className="text-sm font-bold text-white px-3 py-1 bg-brand-gold rounded-lg">
              {selectedProductIds.size} SELECTED
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleBulkSetFeatured(true)}
                className="text-xs font-black uppercase tracking-widest text-brand-gold hover:text-white transition-colors"
              >
                Featured
              </button>
              <button
                onClick={() => handleBulkSetFeatured(false)}
                className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
              >
                Ordinary
              </button>
            </div>
            <div className="h-6 w-px bg-white/10 hidden sm:block"></div>
            <button
              onClick={handleBulkDeleteRequest}
              className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-400"
            >
              Purge Selected
            </button>
          </div>
        )}

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="glass-panel text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
                <th className="p-6 w-20">
                  <div className="flex items-center justify-center">
                    <input
                      ref={headerCheckboxRef}
                      onChange={handleSelectAll}
                      type="checkbox"
                      className="w-5 h-5 rounded-md border-white/10 bg-white/5 text-brand-gold focus:ring-brand-gold focus:ring-offset-brand-charcoal"
                    />
                  </div>
                </th>
                <th className="px-6 py-6">Visual</th>
                <th className="px-6 py-6">Collection Item</th>
                <th className="px-6 py-6">Inventory</th>
                <th className="px-6 py-6">Valuation</th>
                <th className="px-6 py-6">Curated</th>
                <th className="px-6 py-6 text-center">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className={`group hover:bg-white/5 transition-luxury ${selectedProductIds.has(product.id) ? "bg-brand-gold/5" : ""}`}
                >
                  <td className="p-6">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.has(product.id)}
                        onChange={() => handleSelectOne(product.id)}
                        className="w-5 h-5 rounded-md border-white/10 bg-white/5 text-brand-gold focus:ring-brand-gold focus:ring-offset-brand-charcoal"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="h-16 w-16 p-1 glass-panel rounded-2xl group-hover:border-brand-gold transition-luxury">
                      <img
                        src={product.imageUrls[0]}
                        alt={product.name}
                        className="h-full w-full object-cover rounded-xl shadow-lg"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <p className="text-sm font-bold text-white group-hover:text-brand-gold transition-luxury truncate max-w-[200px] mb-1">
                      {product.name}
                    </p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      {product.category}
                    </p>
                  </td>
                  <td className="px-6 py-6">
                    <StockBadge stock={product.stock} />
                  </td>
                  <td className="px-6 py-6">
                    {product.discountPrice &&
                    product.discountPrice < product.price ? (
                      <div className="flex flex-col">
                        <span className="text-brand-gold font-black text-sm">
                          Rs. {product.discountPrice.toLocaleString()}
                        </span>
                        <span className="text-[10px] line-through text-zinc-500 font-bold opacity-60">
                          Rs. {product.price.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-white font-bold text-sm leading-none">
                        Rs. {product.price.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-6">
                    <div
                      onClick={() => toggleFeatured(product.id)}
                      className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-luxury relative ${product.featured ? "bg-brand-gold" : "bg-white/10"}`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-500 ${product.featured ? "left-7 shadow-lg" : "left-1"}`}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex justify-center gap-2 opacity-40 group-hover:opacity-100 transition-luxury">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="p-3 glass-panel rounded-xl text-zinc-400 hover:text-brand-gold hover:bg-brand-gold/10 transition-luxury"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(product.id)}
                        className="p-3 glass-panel rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-luxury"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={
          deleteTarget?.type === "bulk"
            ? `Expunge ${selectedProductIds.size} Selections`
            : "Expunge Item"
        }
        confirmButtonText="Confirm Deletion"
        confirmButtonColor="red"
      >
        This action will permanently remove the selected data from the
        centralized ledger. Are you certain you wish to proceed?
      </ConfirmationModal>

      {isModalOpen && (
        <ProductFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProduct}
          productToEdit={productToEdit}
          productAttributes={productAttributes}
        />
      )}
    </div>
  );
};
