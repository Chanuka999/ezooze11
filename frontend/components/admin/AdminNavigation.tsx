
import React, { useState } from 'react';
import { NavLink, NavLinkChild } from '../../types';
import { NotificationType } from '../Notification';
import { ChevronDownIcon, TrashIcon, PlusIcon, XCircleIcon } from '../icons';

interface AdminNavigationProps {
    navLinks: NavLink[];
    setNavLinks: React.Dispatch<React.SetStateAction<NavLink[]>>;
    addNotification: (message: string, type: NotificationType) => void;
}

export const AdminNavigation: React.FC<AdminNavigationProps> = ({ navLinks, setNavLinks, addNotification }) => {
    const [localNavLinks, setLocalNavLinks] = useState<NavLink[]>(JSON.parse(JSON.stringify(navLinks)));
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);

    const handleSubCategoryChange = (linkId: string, childId: string, field: 'name' | 'subCategory', value: string) => {
        setLocalNavLinks(prev => prev.map(link => {
            if (link.id === linkId) {
                const newChildren = link.children?.map(child => {
                    if (child.id === childId) {
                        const updatedChild = { ...child };
                        if (field === 'name') {
                            updatedChild.name = value;
                        } else {
                            updatedChild.filters = { ...child.filters, subCategory: value };
                        }
                        return updatedChild;
                    }
                    return child;
                });
                return { ...link, children: newChildren };
            }
            return link;
        }));
    };

    const handleAddSubCategory = (linkId: string) => {
        setLocalNavLinks(prev => prev.map(link => {
            if (link.id === linkId) {
                const newChild: NavLinkChild = {
                    id: `new-${Date.now()}`,
                    name: "New Item",
                    filters: { category: link.filters?.category, subCategory: 'new-item' }
                };
                return { ...link, children: [...(link.children || []), newChild] };
            }
            return link;
        }));
    };

    const handleRemoveSubCategory = (linkId: string, childId: string) => {
        setLocalNavLinks(prev => prev.map(link => {
            if (link.id === linkId) {
                return { ...link, children: link.children?.filter(child => child.id !== childId) };
            }
            return link;
        }));
    };

    const handleSaveChanges = () => {
        setNavLinks(localNavLinks);
        addNotification('Navigation updated successfully.', 'success');
    };

    const handleCancelChanges = () => {
        setLocalNavLinks(JSON.parse(JSON.stringify(navLinks)));
        addNotification('Changes discarded.', 'info');
    };
    
    const hasChanges = JSON.stringify(localNavLinks) !== JSON.stringify(navLinks);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-600 dark:text-gray-400">Manage your main navigation dropdown menus and their sub-categories.</p>
                </div>
                <div className="flex items-center space-x-3">
                    {hasChanges && (
                         <button onClick={handleCancelChanges} className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                            <XCircleIcon className="h-5 w-5 mr-1" />
                            Cancel
                        </button>
                    )}
                    <button onClick={handleSaveChanges} disabled={!hasChanges} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-gold hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed">
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {localNavLinks.map(link => {
                    if (!link.children) return null;

                    return (
                        <div key={link.id} className="bg-white dark:bg-brand-charcoal rounded-lg shadow-md border border-gray-200 dark:border-brand-border">
                            <button onClick={() => setOpenAccordion(openAccordion === link.id ? null : link.id)} className="w-full flex justify-between items-center p-4 text-left">
                                <h3 className="text-lg font-semibold">{link.name}</h3>
                                <ChevronDownIcon className={`h-5 w-5 transform transition-transform ${openAccordion === link.id ? 'rotate-180' : ''}`} />
                            </button>
                            {openAccordion === link.id && (
                                <div className="p-4 border-t dark:border-brand-border space-y-3 animate-fadeIn">
                                    {link.children.map(child => (
                                        <div key={child.id} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-brand-surface rounded-md">
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500">Name</label>
                                                <input
                                                    type="text"
                                                    value={child.name}
                                                    onChange={(e) => handleSubCategoryChange(link.id, child.id, 'name', e.target.value)}
                                                    className="w-full p-1 border-b bg-transparent focus:outline-none focus:border-brand-gold"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                 <label className="text-xs text-gray-500">Sub-Category Slug</label>
                                                <input
                                                    type="text"
                                                    value={child.filters.subCategory}
                                                    onChange={(e) => handleSubCategoryChange(link.id, child.id, 'subCategory', e.target.value)}
                                                    className="w-full p-1 border-b bg-transparent focus:outline-none focus:border-brand-gold"
                                                />
                                            </div>
                                            <button onClick={() => handleRemoveSubCategory(link.id, child.id)} className="p-2 text-gray-400 hover:text-red-500"><TrashIcon className="h-5 w-5" /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => handleAddSubCategory(link.id)} className="flex items-center text-sm font-medium text-brand-gold hover:text-yellow-600 mt-3">
                                        <PlusIcon className="h-5 w-5 mr-1"/> Add Sub-Category
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
};