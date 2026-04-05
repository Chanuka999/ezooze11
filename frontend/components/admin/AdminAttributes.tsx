
import React, { useState } from 'react';
import { ProductAttributes } from '../../types';
import { NotificationType } from '../Notification';
import { PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, CloseIcon } from '../icons';

interface AdminAttributesProps {
    attributes: ProductAttributes;
    setAttributes: React.Dispatch<React.SetStateAction<ProductAttributes>>;
    addNotification: (message: string, type: NotificationType) => void;
}

type AttributeKey = keyof ProductAttributes;

const AttributeSection: React.FC<{
    title: string;
    items: string[];
    onAdd: (item: string) => void;
    onRemove: (item: string) => void;
    onUpdate: (oldItem: string, newItem: string) => void;
}> = ({ title, items, onAdd, onRemove, onUpdate }) => {
    const [newItem, setNewItem] = useState('');
    const [editingItem, setEditingItem] = useState<{ old: string; current: string } | null>(null);

    const handleAdd = () => {
        if (newItem && !items.includes(newItem)) {
            onAdd(newItem);
            setNewItem('');
        }
    };

    const handleUpdate = () => {
        if (editingItem && editingItem.current && !items.includes(editingItem.current)) {
            onUpdate(editingItem.old, editingItem.current);
            setEditingItem(null);
        } else if (editingItem && editingItem.current === editingItem.old) {
            setEditingItem(null);
        }
    };

    return (
        <div className="bg-white dark:bg-brand-charcoal p-6 rounded-lg shadow-md border border-gray-200 dark:border-brand-border">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="flex space-x-2 mb-4">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder={`New ${title.slice(0, -1)}...`}
                    className="flex-grow p-2 border border-gray-300 rounded-md dark:bg-brand-surface dark:border-brand-border"
                />
                <button onClick={handleAdd} className="p-2 bg-brand-gold text-white rounded-md hover:bg-yellow-600">
                    <PlusIcon className="h-5 w-5" />
                </button>
            </div>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
                {items.map(item => (
                    <li key={item} className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-brand-surface">
                        {editingItem?.old === item ? (
                            <input
                                type="text"
                                value={editingItem.current}
                                onChange={(e) => setEditingItem({ ...editingItem, current: e.target.value })}
                                className="flex-grow p-1 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
                            />
                        ) : (
                            <span className="text-sm">{item}</span>
                        )}
                        <div className="flex items-center space-x-1">
                             {editingItem?.old === item ? (
                                <>
                                    <button onClick={handleUpdate} className="p-1 text-green-500 hover:text-green-700"><CheckCircleIcon className="h-5 w-5"/></button>
                                    <button onClick={() => setEditingItem(null)} className="p-1 text-gray-500 hover:text-gray-700"><CloseIcon className="h-5 w-5"/></button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setEditingItem({ old: item, current: item })} className="p-1 text-gray-400 hover:text-blue-600"><PencilIcon className="h-4 w-4"/></button>
                                    <button onClick={() => onRemove(item)} className="p-1 text-gray-400 hover:text-red-600"><TrashIcon className="h-4 w-4"/></button>
                                </>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export const AdminAttributes: React.FC<AdminAttributesProps> = ({ attributes, setAttributes, addNotification }) => {
    
    const handleAdd = (key: AttributeKey, item: string) => {
        setAttributes(prev => ({
            ...prev,
            [key]: [...prev[key], item].sort()
        }));
        addNotification(`Added "${item}" to ${key}.`, 'success');
    };
    
    const handleRemove = (key: AttributeKey, item: string) => {
        setAttributes(prev => ({
            ...prev,
            [key]: prev[key].filter(i => i !== item)
        }));
        addNotification(`Removed "${item}" from ${key}.`, 'info');
    };

    const handleUpdate = (key: AttributeKey, oldItem: string, newItem: string) => {
        setAttributes(prev => ({
            ...prev,
            [key]: prev[key].map(i => i === oldItem ? newItem : i).sort()
        }));
        addNotification(`Updated "${oldItem}" to "${newItem}".`, 'success');
    };

    return (
        <div className="space-y-6">
            <div>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage the reusable properties for your products. These options will appear in dropdowns and selectors when adding or editing a product.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AttributeSection 
                    title="Sub-Categories" 
                    items={attributes.subCategories}
                    onAdd={(item) => handleAdd('subCategories', item)}
                    onRemove={(item) => handleRemove('subCategories', item)}
                    onUpdate={(oldItem, newItem) => handleUpdate('subCategories', oldItem, newItem)}
                />
                 <AttributeSection 
                    title="Colors" 
                    items={attributes.colors}
                    onAdd={(item) => handleAdd('colors', item)}
                    onRemove={(item) => handleRemove('colors', item)}
                    onUpdate={(oldItem, newItem) => handleUpdate('colors', oldItem, newItem)}
                />
                 <AttributeSection 
                    title="Materials" 
                    items={attributes.materials}
                    onAdd={(item) => handleAdd('materials', item)}
                    onRemove={(item) => handleRemove('materials', item)}
                    onUpdate={(oldItem, newItem) => handleUpdate('materials', oldItem, newItem)}
                />
                 <AttributeSection 
                    title="Sizes" 
                    items={attributes.sizes}
                    onAdd={(item) => handleAdd('sizes', item)}
                    onRemove={(item) => handleRemove('sizes', item)}
                    onUpdate={(oldItem, newItem) => handleUpdate('sizes', oldItem, newItem)}
                />
            </div>
        </div>
    );
};