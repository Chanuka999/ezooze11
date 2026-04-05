
import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductAttributes } from '../../types';
import { PencilIcon, TrashIcon, PlusIcon } from '../icons';
import { ProductFormModal } from './ProductFormModal';
import { ConfirmationModal } from '../ConfirmationModal';
import { NotificationType } from '../Notification';

interface AdminProductsProps {
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    addNotification: (message: string, type: NotificationType) => void;
    productAttributes: ProductAttributes;
}

const StockBadge: React.FC<{ stock: number }> = ({ stock }) => {
    if (stock === 0) {
        return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 dark:bg-red-900/30 dark:text-red-300 rounded-full">Out of Stock</span>;
    }
    if (stock <= 5) {
        return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full">Low Stock</span>;
    }
    return <span className="text-gray-600 dark:text-gray-300">{stock}</span>;
};


export const AdminProducts: React.FC<AdminProductsProps> = ({ products, setProducts, addNotification, productAttributes }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProductIds, setSelectedProductIds] = useState(new Set<string | number>());
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'single' | 'bulk'; id?: string | number } | null>(null);

    const headerCheckboxRef = useRef<HTMLInputElement>(null);

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    useEffect(() => {
        if (headerCheckboxRef.current) {
            const allVisibleSelected = filteredProducts.length > 0 && selectedProductIds.size === filteredProducts.length;
            headerCheckboxRef.current.checked = allVisibleSelected;
            headerCheckboxRef.current.indeterminate = selectedProductIds.size > 0 && selectedProductIds.size < filteredProducts.length;
        }
    }, [selectedProductIds, filteredProducts]);
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedProductIds(new Set(filteredProducts.map(p => p.id)));
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
        setDeleteTarget({ type: 'single', id: productId });
    };
    
    const handleBulkDeleteRequest = () => {
        setDeleteTarget({ type: 'bulk' });
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
    
        if (deleteTarget.type === 'single' && deleteTarget.id) {
            setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
            addNotification('Product successfully deleted.', 'success');
        } else if (deleteTarget.type === 'bulk') {
            const count = selectedProductIds.size;
            setProducts(prev => prev.filter(p => !selectedProductIds.has(p.id)));
            setSelectedProductIds(new Set());
            addNotification(`${count} product${count > 1 ? 's' : ''} successfully deleted.`, 'success');
        }
    };

    const handleSaveProduct = (productData: Omit<Product, 'id' | 'createdAt'> & { id?: string | number, createdAt?: string }) => {
        const isEditing = !!productData.id;
        if (isEditing) {
            setProducts(prev => prev.map(p => p.id === productData.id ? { ...p, ...productData } as Product : p));
        } else {
            const newProduct: Product = {
                ...productData,
                id: Date.now(), // Simple unique ID for mock data
                createdAt: new Date().toISOString(),
            };
            setProducts(prev => [newProduct, ...prev]);
        }
        setIsModalOpen(false);
        addNotification(`Product successfully ${isEditing ? 'updated' : 'created'}.`, 'success');
    };
    
    const toggleFeatured = (productId: string | number) => {
        setProducts(prev => prev.map(p => p.id === productId ? {...p, featured: !p.featured} : p));
    };
    
    const handleBulkSetFeatured = (featured: boolean) => {
        setProducts(prev => prev.map(p => selectedProductIds.has(p.id) ? { ...p, featured } : p));
        setSelectedProductIds(new Set());
        addNotification(`${selectedProductIds.size} product${selectedProductIds.size > 1 ? 's' : ''} ${featured ? 'set as featured' : 'removed from featured'}.`, 'info');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm p-2 border border-gray-300 rounded-md dark:bg-brand-surface dark:border-brand-border dark:text-white"
                />
                <button
                    onClick={handleAddProduct}
                    className="flex items-center bg-brand-gold text-white px-4 py-2 rounded-md font-semibold hover:bg-yellow-600 transition-colors whitespace-nowrap"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Product
                </button>
            </div>
            
            <div className="bg-white dark:bg-brand-charcoal rounded-lg shadow-md border border-gray-200 dark:border-brand-border overflow-hidden">
                {selectedProductIds.size > 0 && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-b dark:border-brand-border flex items-center space-x-4 animate-fadeIn">
                        <p className="text-sm font-semibold">{selectedProductIds.size} selected</p>
                        <button onClick={() => handleBulkSetFeatured(true)} className="text-sm font-medium text-brand-gold hover:text-yellow-600">Set as Featured</button>
                        <button onClick={() => handleBulkSetFeatured(false)} className="text-sm font-medium text-brand-gold hover:text-yellow-600">Remove from Featured</button>
                        <div className="h-4 border-l border-gray-300 dark:border-gray-500"></div>
                        <button onClick={handleBulkDeleteRequest} className="text-sm font-medium text-red-600 hover:text-red-700">Delete</button>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-900/50 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="p-4">
                                    <div className="flex items-center">
                                        <input 
                                            ref={headerCheckboxRef}
                                            onChange={handleSelectAll}
                                            id="checkbox-all" 
                                            type="checkbox" 
                                            className="w-4 h-4 text-brand-gold bg-gray-100 border-gray-300 rounded focus:ring-brand-gold dark:focus:ring-yellow-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" 
                                        />
                                        <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-3">Image</th>
                                <th scope="col" className="px-6 py-3">Product Name</th>
                                <th scope="col" className="px-6 py-3">Stock</th>
                                <th scope="col" className="px-6 py-3">Price</th>
                                <th scope="col" className="px-6 py-3">Featured</th>
                                <th scope="col" className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id} className={`bg-white dark:bg-brand-charcoal border-b dark:border-brand-border hover:bg-gray-50 dark:hover:bg-gray-600/20 ${selectedProductIds.has(product.id) ? 'bg-brand-gold/10' : ''}`}>
                                    <td className="w-4 p-4">
                                        <div className="flex items-center">
                                            <input 
                                                id={`checkbox-${product.id}`} 
                                                type="checkbox" 
                                                checked={selectedProductIds.has(product.id)}
                                                onChange={() => handleSelectOne(product.id)}
                                                className="w-4 h-4 text-brand-gold bg-gray-100 border-gray-300 rounded focus:ring-brand-gold dark:focus:ring-yellow-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" 
                                            />
                                            <label htmlFor={`checkbox-${product.id}`} className="sr-only">checkbox</label>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <img src={product.imageUrls[0]} alt={product.name} className="h-12 w-12 object-cover rounded-md" />
                                    </td>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                        {product.name}
                                    </th>
                                    <td className="px-6 py-4">
                                        <StockBadge stock={product.stock} />
                                    </td>
                                    <td className="px-6 py-4">
                                        {product.discountPrice && product.discountPrice < product.price ? (
                                            <div>
                                                <span className="text-red-600 dark:text-red-400 font-bold">Rs. {product.discountPrice.toLocaleString()}</span>
                                                <span className="ml-2 line-through text-gray-500">Rs. {product.price.toLocaleString()}</span>
                                            </div>
                                        ) : (
                                            `Rs. ${product.price.toLocaleString()}`
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <label htmlFor={`featured-${product.id}`} className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" id={`featured-${product.id}`} className="sr-only peer" checked={product.featured} onChange={() => toggleFeatured(product.id)} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-gold/50 dark:peer-focus:ring-yellow-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-gold"></div>
                                        </label>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={() => handleEditProduct(product)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button onClick={() => handleDeleteRequest(product.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <TrashIcon className="h-5 w-5" />
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
                title={deleteTarget?.type === 'bulk' ? `Delete ${selectedProductIds.size} Products` : 'Delete Product'}
                confirmButtonText="Delete"
                confirmButtonColor="red"
            >
                Are you sure you want to delete {deleteTarget?.type === 'bulk' ? `these ${selectedProductIds.size} products` : 'this product'}? This action cannot be undone.
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
