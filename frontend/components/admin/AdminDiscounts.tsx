

import React, { useState } from 'react';
import { DiscountCode } from '../../types';
import { NotificationType } from '../Notification';
import { PlusIcon, PencilIcon, TrashIcon } from '../icons';
import { DiscountFormModal } from './DiscountFormModal';
import { ConfirmationModal } from '../ConfirmationModal';

interface AdminDiscountsProps {
    discountCodes: DiscountCode[];
    setDiscountCodes: React.Dispatch<React.SetStateAction<DiscountCode[]>>;
    addNotification: (message: string, type: NotificationType) => void;
}

const StatusBadge: React.FC<{ code: DiscountCode }> = ({ code }) => {
    const now = new Date();
    if (!code.isActive) {
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Inactive</span>;
    }
    if (code.expiresAt && new Date(code.expiresAt) < now) {
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Expired</span>;
    }
    if (code.usageLimit && (code.uses || 0) >= code.usageLimit) {
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">Used Up</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Active</span>;
};

export const AdminDiscounts: React.FC<AdminDiscountsProps> = ({ discountCodes, setDiscountCodes, addNotification }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [codeToEdit, setCodeToEdit] = useState<DiscountCode | null>(null);
    const [codeToDelete, setCodeToDelete] = useState<DiscountCode | null>(null);

    const handleAddCode = () => {
        setCodeToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditCode = (code: DiscountCode) => {
        setCodeToEdit(code);
        setIsModalOpen(true);
    };

    const handleDeleteCode = (code: DiscountCode) => {
        setCodeToDelete(code);
    };
    
    const confirmDelete = () => {
        if (!codeToDelete) return;
        setDiscountCodes(prev => prev.filter(c => c.id !== codeToDelete.id));
        addNotification(`Discount code "${codeToDelete.code}" deleted.`, 'success');
        setCodeToDelete(null);
    };

    const handleSaveCode = (codeData: Omit<DiscountCode, 'id'> & { id?: number }) => {
        const isEditing = !!codeData.id;
        if (isEditing) {
            setDiscountCodes(prev => prev.map(c => c.id === codeData.id ? codeData as DiscountCode : c));
        } else {
            const newCode: DiscountCode = {
                ...codeData,
                id: Date.now(),
                uses: 0,
            };
            setDiscountCodes(prev => [newCode, ...prev]);
        }
        setIsModalOpen(false);
        addNotification(`Discount code "${codeData.code}" successfully ${isEditing ? 'updated' : 'created'}.`, 'success');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <p className="text-gray-600 dark:text-gray-400">Create and manage promotional discount codes for your store.</p>
                <button
                    onClick={handleAddCode}
                    className="flex items-center bg-brand-gold text-white px-4 py-2 rounded-md font-semibold hover:bg-yellow-600 transition-colors"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create Discount
                </button>
            </div>

            <div className="bg-white dark:bg-brand-charcoal rounded-lg shadow-md border border-gray-200 dark:border-brand-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-900/50 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Code</th>
                                <th scope="col" className="px-6 py-3">Type</th>
                                <th scope="col" className="px-6 py-3">Value</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Usage</th>
                                <th scope="col" className="px-6 py-3">Expires At</th>
                                <th scope="col" className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {discountCodes.map(code => (
                                <tr key={code.id} className="bg-white dark:bg-brand-charcoal border-b dark:border-brand-border hover:bg-gray-50 dark:hover:bg-gray-600/20">
                                    <td className="px-6 py-4 font-mono font-semibold text-gray-900 dark:text-white">{code.code}</td>
                                    <td className="px-6 py-4 capitalize">{code.type.replace('_', ' ')}</td>
                                    <td className="px-6 py-4">
                                        {code.type === 'percentage' ? `${code.value}%` : 
                                         code.type === 'fixed' ? `Rs. ${code.value.toLocaleString()}` : '—'}
                                    </td>
                                    <td className="px-6 py-4"><StatusBadge code={code} /></td>
                                    <td className="px-6 py-4">{code.uses || 0} / {code.usageLimit ? code.usageLimit : '∞'}</td>
                                    <td className="px-6 py-4">{code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : 'Never'}</td>
                                    <td className="px-6 py-4 text-right">
                                         <div className="flex justify-end space-x-2">
                                            <button onClick={() => handleEditCode(code)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button onClick={() => handleDeleteCode(code)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
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

            {isModalOpen && (
                <DiscountFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveCode}
                    codeToEdit={codeToEdit}
                />
            )}

            <ConfirmationModal
                isOpen={!!codeToDelete}
                onClose={() => setCodeToDelete(null)}
                onConfirm={confirmDelete}
                title={`Delete Discount Code: ${codeToDelete?.code}`}
                confirmButtonText="Delete"
                confirmButtonColor="red"
            >
                Are you sure you want to delete this discount code? This action cannot be undone.
            </ConfirmationModal>
        </div>
    );
};