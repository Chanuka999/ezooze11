

import React, { useState, useEffect } from 'react';
import { DiscountCode } from '../../types';
import { CloseIcon } from '../icons';

interface DiscountFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (codeData: Omit<DiscountCode, 'id' | 'uses'> & { id?: number }) => void;
    codeToEdit: DiscountCode | null;
}

const initialCodeState: Omit<DiscountCode, 'id' | 'uses'> = {
    code: '',
    type: 'percentage',
    value: 0,
    isActive: true,
    minimumPurchase: undefined,
    usageLimit: undefined,
    expiresAt: '',
};

export const DiscountFormModal: React.FC<DiscountFormModalProps> = ({ isOpen, onClose, onSave, codeToEdit }) => {
    const [codeData, setCodeData] = useState(initialCodeState);

    useEffect(() => {
        if (codeToEdit) {
            setCodeData({
                ...codeToEdit,
                expiresAt: codeToEdit.expiresAt ? codeToEdit.expiresAt.split('T')[0] : '', // Format for date input
            });
        } else {
            setCodeData(initialCodeState);
        }
    }, [codeToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setCodeData(prev => ({ ...prev, [name]: checked }));
        } else {
            let newValue: string | number = value;
            if (name === 'type' && value === 'free_shipping') {
                setCodeData(prev => ({ ...prev, value: 0, type: 'free_shipping' }));
                return;
            }
             if (name === 'minimumPurchase' && value === '') {
                // Allow clearing optional number fields
                const { minimumPurchase, ...rest } = codeData;
                setCodeData(rest as any);
                return;
            }
             if (name === 'usageLimit' && value === '') {
                const { usageLimit, ...rest } = codeData;
                setCodeData(rest as any);
                return;
            }
            setCodeData(prev => ({ ...prev, [name]: newValue }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...codeData,
            value: Number(codeData.value) || 0,
            code: codeData.code.toUpperCase(),
            minimumPurchase: codeData.minimumPurchase ? Number(codeData.minimumPurchase) : undefined,
            usageLimit: codeData.usageLimit ? Number(codeData.usageLimit) : undefined,
            expiresAt: codeData.expiresAt ? new Date(codeData.expiresAt).toISOString() : undefined,
        };
        onSave(dataToSave);
    };

    if (!isOpen) return null;

    const inputClass = "block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-gold focus:border-brand-gold dark:bg-brand-surface dark:border-brand-border dark:text-white disabled:opacity-50";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-brand-charcoal rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-brand-border flex justify-between items-center">
                    <h2 className="text-xl font-serif font-semibold">{codeToEdit ? 'Edit Discount Code' : 'Create Discount Code'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="code" className={labelClass}>Discount Code</label>
                            <input type="text" id="code" name="code" value={codeData.code} onChange={handleChange} className={`${inputClass} uppercase`} placeholder="e.g., SUMMER25" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="type" className={labelClass}>Type</label>
                                <select id="type" name="type" value={codeData.type} onChange={handleChange} className={inputClass} required>
                                    <option value="percentage">Percentage</option>
                                    <option value="fixed">Fixed Amount</option>
                                    <option value="free_shipping">Free Shipping</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="value" className={labelClass}>Value</label>
                                <input type="number" id="value" name="value" value={codeData.value} onChange={handleChange} className={inputClass} min="0" required disabled={codeData.type === 'free_shipping'} />
                            </div>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="minimumPurchase" className={labelClass}>Minimum Purchase (Rs.) <span className="text-xs text-gray-400">Optional</span></label>
                                <input type="number" id="minimumPurchase" name="minimumPurchase" value={codeData.minimumPurchase || ''} onChange={handleChange} className={inputClass} min="0" placeholder="e.g., 5000" />
                            </div>
                            <div>
                                <label htmlFor="usageLimit" className={labelClass}>Total Usage Limit <span className="text-xs text-gray-400">Optional</span></label>
                                <input type="number" id="usageLimit" name="usageLimit" value={codeData.usageLimit || ''} onChange={handleChange} className={inputClass} min="0" placeholder="e.g., 100" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="expiresAt" className={labelClass}>Expiration Date <span className="text-xs text-gray-400">Optional</span></label>
                            <input type="date" id="expiresAt" name="expiresAt" value={codeData.expiresAt} onChange={handleChange} className={inputClass} />
                        </div>
                        <div className="flex items-center pt-2">
                            <input type="checkbox" id="isActive" name="isActive" checked={codeData.isActive} onChange={handleChange} className="h-4 w-4 text-brand-gold border-gray-300 rounded focus:ring-brand-gold" />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Active</label>
                        </div>
                    </div>
                    <div className="p-6 flex justify-end space-x-3 border-t border-gray-200 dark:border-brand-border">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
                        <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-gold hover:bg-yellow-600">Save Code</button>
                    </div>
                </form>
            </div>
        </div>
    );
};