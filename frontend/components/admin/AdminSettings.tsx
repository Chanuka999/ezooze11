import React, { useState, useEffect } from 'react';
import { StoreSettings, User } from '../../types';
import { InformationCircleIcon, UserCircleIcon, LockClosedIcon } from '../icons';
import { NotificationType } from '../Notification';
import { api } from '../../api';

interface AdminSettingsProps {
    settings: StoreSettings;
    setSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
    addNotification: (message: string, type: NotificationType) => void;
    currentUser: User | null;
    onUpdateUser: (user: Partial<User> & {id: string}) => Promise<void>;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ settings, setSettings, addNotification, currentUser, onUpdateUser }) => {
    const [localSettings, setLocalSettings] = useState<StoreSettings>(settings);
    
    // Admin Profile State
    const [adminName, setAdminName] = useState(currentUser?.name || '');
    const [adminEmail, setAdminEmail] = useState(currentUser?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    useEffect(() => {
        if (currentUser) {
            setAdminName(currentUser.name);
            setAdminEmail(currentUser.email);
        }
    }, [currentUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const target = e.target as HTMLInputElement;

        if (type === 'checkbox') {
            const { checked } = target;
             if (name === 'isFreeShippingThresholdActive') {
                setLocalSettings(prev => ({ ...prev, isFreeShippingThresholdActive: checked }));
            } else if (name === 'creditCard' || name === 'payOnDelivery') {
                setLocalSettings(prev => ({
                    ...prev,
                    paymentMethods: {
                        ...prev.paymentMethods,
                        [name]: checked
                    }
                }));
            }
        } else if (target.type === 'number') {
            const numValue = parseFloat(value);
            setLocalSettings(prev => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }));
        } else {
            setLocalSettings(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [name]: value,
            }
        }));
    };

    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        setSettings(localSettings);
        addNotification('Store settings saved successfully.', 'success');
        window.scrollTo(0, 0);
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        setProfileLoading(true);
        try {
            await onUpdateUser({ id: currentUser.id, name: adminName, email: adminEmail });
            addNotification('Admin profile updated successfully.', 'success');
        } catch (error) {
            console.error(error);
            addNotification('Failed to update profile.', 'error');
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        
        // Validation
        if (!currentPassword) {
            addNotification('Current password is required.', 'error');
            return;
        }

        if (!newPassword) {
            addNotification('New password is required.', 'error');
            return;
        }

        if (newPassword.length < 6) {
            addNotification('New password must be at least 6 characters.', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            addNotification('New passwords do not match.', 'error');
            return;
        }

        if (currentPassword === newPassword) {
            addNotification('New password must be different from current password.', 'error');
            return;
        }

        setPasswordLoading(true);
        try {
            await api.dbClient.changePassword(currentUser.id, currentPassword, newPassword, confirmPassword);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            addNotification('Password updated successfully.', 'success');
        } catch (error: any) {
            const errorMsg = error?.message || 'Failed to update password.';
            console.error(error);
            addNotification(errorMsg, 'error');
        } finally {
            setPasswordLoading(false);
        }
    };
    
    const inputClass = "block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-gold focus:border-brand-gold dark:bg-brand-surface dark:border-brand-border dark:text-white disabled:opacity-50 disabled:cursor-not-allowed";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

    return (
        <div className="space-y-10">
             
             {/* --- Store Settings Section --- */}
             <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Store Settings</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your store's general information and configuration.</p>
                    </div>
                    <div className="flex items-center flex-shrink-0">
                        <button
                            type="submit"
                            form="settings-form"
                            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-gold hover:bg-yellow-600"
                        >
                            Save Store Settings
                        </button>
                    </div>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <InformationCircleIcon className="h-5 w-5 text-blue-400 dark:text-blue-500" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Changes made here will affect the public-facing storefront.
                            </p>
                        </div>
                    </div>
                </div>

                <form id="settings-form" onSubmit={handleSaveSettings} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Store Information */}
                            <div className="bg-white dark:bg-brand-charcoal p-6 rounded-lg shadow-md border border-gray-200 dark:border-brand-border">
                                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Store Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="storeName" className={labelClass}>Store Name</label>
                                        <input type="text" id="storeName" name="storeName" value={localSettings.storeName} onChange={handleChange} className={inputClass} />
                                    </div>
                                    <div>
                                        <label htmlFor="contactEmail" className={labelClass}>Contact Email</label>
                                        <input type="email" id="contactEmail" name="contactEmail" value={localSettings.contactEmail} onChange={handleChange} className={inputClass} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label htmlFor="address" className={labelClass}>Address</label>
                                        <input type="text" id="address" name="address" value={localSettings.address} onChange={handleChange} className={inputClass} />
                                    </div>
                                </div>
                            </div>

                            {/* Financial Settings */}
                            <div className="bg-white dark:bg-brand-charcoal p-6 rounded-lg shadow-md border border-gray-200 dark:border-brand-border">
                                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Financial Settings</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="standardShippingCost" className={labelClass}>Standard Shipping Cost</label>
                                        <input type="number" id="standardShippingCost" name="standardShippingCost" value={localSettings.standardShippingCost} onChange={handleChange} className={inputClass} min="0" />
                                    </div>
                                    
                                    <div className="md:col-span-2 border-t dark:border-brand-border pt-6 flex items-center justify-between">
                                        <label htmlFor="isFreeShippingThresholdActive" className={labelClass}>Enable Free Shipping Threshold</label>
                                        <label htmlFor="isFreeShippingThresholdActive" className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                id="isFreeShippingThresholdActive" 
                                                name="isFreeShippingThresholdActive"
                                                className="sr-only peer" 
                                                checked={localSettings.isFreeShippingThresholdActive} 
                                                onChange={handleChange} 
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-gold/50 dark:peer-focus:ring-yellow-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-gold"></div>
                                        </label>
                                    </div>
                                    <div>
                                        <label htmlFor="freeShippingThreshold" className={`${labelClass} ${!localSettings.isFreeShippingThresholdActive ? 'text-gray-400 dark:text-gray-500' : ''}`}>Free Shipping Threshold</label>
                                        <input 
                                            type="number" 
                                            id="freeShippingThreshold" 
                                            name="freeShippingThreshold" 
                                            value={localSettings.freeShippingThreshold} 
                                            onChange={handleChange} 
                                            className={inputClass} 
                                            min="0" 
                                            disabled={!localSettings.isFreeShippingThresholdActive}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="taxRate" className={labelClass}>Tax Rate (%)</label>
                                        <input type="number" id="taxRate" name="taxRate" value={localSettings.taxRate || 0} onChange={handleChange} className={inputClass} min="0" step="0.01" />
                                    </div>
                                </div>
                            </div>
                            
                             {/* Payment Settings */}
                            <div className="bg-white dark:bg-brand-charcoal p-6 rounded-lg shadow-md border border-gray-200 dark:border-brand-border">
                                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Payment Methods</h2>
                                <div className="space-y-4">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mb-4">
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            <strong>Cash on Delivery Only:</strong> This website is configured to accept cash on delivery payments only. Credit card payments are disabled.
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                                        <label htmlFor="creditCard" className={labelClass}>Enable Credit Card Payments (Disabled)</label>
                                        <label htmlFor="creditCard" className="relative inline-flex items-center">
                                            <input 
                                                type="checkbox" 
                                                id="creditCard" 
                                                name="creditCard"
                                                className="sr-only peer" 
                                                checked={false} 
                                                disabled
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between border-t dark:border-brand-border pt-4">
                                        <label htmlFor="payOnDelivery" className={labelClass}>Cash on Delivery (Always Enabled)</label>
                                        <label htmlFor="payOnDelivery" className="relative inline-flex items-center">
                                            <input 
                                                type="checkbox" 
                                                id="payOnDelivery" 
                                                name="payOnDelivery"
                                                className="sr-only peer" 
                                                checked={true} 
                                                disabled
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-gold"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Social Media Links */}
                            <div className="bg-white dark:bg-brand-charcoal p-6 rounded-lg shadow-md border border-gray-200 dark:border-brand-border">
                                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Social Media</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="instagram" className={labelClass}>Instagram URL</label>
                                        <input type="url" id="instagram" name="instagram" value={localSettings.socialLinks.instagram} onChange={handleSocialChange} className={inputClass} placeholder="https://instagram.com/your-profile" />
                                    </div>
                                    <div>
                                        <label htmlFor="facebook" className={labelClass}>Facebook URL</label>
                                        <input type="url" id="facebook" name="facebook" value={localSettings.socialLinks.facebook} onChange={handleSocialChange} className={inputClass} placeholder="https://facebook.com/your-page" />
                                    </div>
                                    <div>
                                        <label htmlFor="twitter" className={labelClass}>Twitter URL</label>
                                        <input type="url" id="twitter" name="twitter" value={localSettings.socialLinks.twitter} onChange={handleSocialChange} className={inputClass} placeholder="https://twitter.com/your-handle" />
                                    </div>
                                    <div>
                                        <label htmlFor="pinterest" className={labelClass}>Pinterest URL</label>
                                        <input type="url" id="pinterest" name="pinterest" value={localSettings.socialLinks.pinterest} onChange={handleSocialChange} className={inputClass} placeholder="https://pinterest.com/your-profile" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            {/* Currency Settings */}
                            <div className="bg-white dark:bg-brand-charcoal p-6 rounded-lg shadow-md border border-gray-200 dark:border-brand-border">
                                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Currency</h2>
                                <div>
                                    <label htmlFor="currency" className={labelClass}>Store Currency</label>
                                    <select id="currency" name="currency" value={localSettings.currency} onChange={handleChange} className={inputClass} >
                                        <option value="LKR">Sri Lankan Rupee (LKR)</option>
                                        <option value="USD">United States Dollar (USD)</option>
                                        <option value="EUR">Euro (EUR)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            
            <div className="border-t border-gray-200 dark:border-brand-border"></div>

            {/* --- Admin Account Management Section --- */}
            <div className="space-y-6">
                 <div>
                    <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Admin Account</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Update your personal admin profile and security credentials.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Profile Details Form */}
                    <div className="bg-white dark:bg-brand-charcoal p-6 rounded-lg shadow-md border border-gray-200 dark:border-brand-border">
                        <div className="flex items-center mb-4">
                             <UserCircleIcon className="h-6 w-6 text-brand-gold mr-2" />
                             <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Details</h2>
                        </div>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label htmlFor="adminName" className={labelClass}>Name</label>
                                <input 
                                    type="text" 
                                    id="adminName" 
                                    value={adminName} 
                                    onChange={(e) => setAdminName(e.target.value)} 
                                    className={inputClass} 
                                    required 
                                />
                            </div>
                            <div>
                                <label htmlFor="adminEmail" className={labelClass}>Email</label>
                                <input 
                                    type="email" 
                                    id="adminEmail" 
                                    value={adminEmail} 
                                    onChange={(e) => setAdminEmail(e.target.value)} 
                                    className={inputClass} 
                                    required 
                                />
                            </div>
                             <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={profileLoading}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-charcoal hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {profileLoading ? 'Updating...' : 'Update Profile'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Change Password Form */}
                    <div className="bg-white dark:bg-brand-charcoal p-6 rounded-lg shadow-md border border-gray-200 dark:border-brand-border">
                         <div className="flex items-center mb-4">
                             <LockClosedIcon className="h-6 w-6 text-brand-gold mr-2" />
                             <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Change Password</h2>
                        </div>
                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                            <div>
                                <label htmlFor="currentPassword" className={labelClass}>Current Password</label>
                                <input 
                                    type="password" 
                                    id="currentPassword" 
                                    value={currentPassword} 
                                    onChange={(e) => setCurrentPassword(e.target.value)} 
                                    className={inputClass} 
                                    placeholder="Your current password"
                                    required 
                                />
                            </div>
                            <div>
                                <label htmlFor="newPassword" className={labelClass}>New Password</label>
                                <input 
                                    type="password" 
                                    id="newPassword" 
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)} 
                                    className={inputClass} 
                                    placeholder="Min 6 characters"
                                    minLength={6}
                                    required 
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className={labelClass}>Confirm New Password</label>
                                <input 
                                    type="password" 
                                    id="confirmPassword" 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    className={inputClass} 
                                    required 
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-charcoal hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {passwordLoading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
