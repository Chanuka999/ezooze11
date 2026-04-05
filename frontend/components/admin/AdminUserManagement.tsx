
import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import { NotificationType } from '../Notification';
import { ConfirmationModal } from '../ConfirmationModal';

interface AdminUserManagementProps {
    users: User[];
    onUpdateUser: (user: Partial<User> & {id: string}) => Promise<void>;
    addNotification: (message: string, type: NotificationType) => void;
    currentUser: User | null;
}

export const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ users, onUpdateUser, addNotification, currentUser }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [userToDemote, setUserToDemote] = useState<User | null>(null);

    const filteredUsers = useMemo(() => {
        return users.filter(u => 
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);
    
    const handleRoleChange = async (user: User) => {
        const isCurrentlyAdmin = user.role === 'admin';
        
        if (isCurrentlyAdmin) {
            // If demoting, open confirmation modal
            setUserToDemote(user);
        } else {
            // If promoting, just do it
            try {
                await onUpdateUser({ id: user.id, role: 'admin' });
                addNotification(`${user.name} has been promoted to Admin.`, 'success');
            } catch (error) {
                addNotification(`Failed to promote ${user.name}.`, 'error');
            }
        }
    };
    
    const confirmDemotion = async () => {
        if (!userToDemote) return;
        
        try {
            await onUpdateUser({ id: userToDemote.id, role: undefined });
            addNotification(`${userToDemote.name} has been demoted to Customer.`, 'info');
        } catch (error) {
            addNotification(`Failed to demote ${userToDemote.name}.`, 'error');
        } finally {
            setUserToDemote(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                 <p className="text-gray-600 dark:text-gray-400">Grant or revoke administrator privileges for users.</p>
            </div>
             <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-sm p-2 border border-gray-300 rounded-md dark:bg-brand-surface dark:border-brand-border dark:text-white"
            />
            <div className="bg-white dark:bg-brand-charcoal rounded-lg shadow-md border border-gray-200 dark:border-brand-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-900/50 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">User</th>
                                <th scope="col" className="px-6 py-3">Role</th>
                                <th scope="col" className="px-6 py-3 text-center">Admin Access</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="bg-white dark:bg-brand-charcoal border-b dark:border-brand-border">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                        <div className="font-semibold">{user.name}</div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                    </th>
                                    <td className="px-6 py-4">
                                        <span className={`font-semibold ${user.role === 'admin' ? 'text-brand-gold' : 'text-gray-500'}`}>
                                            {user.role === 'admin' ? 'Admin' : 'Customer'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                         <label htmlFor={`admin-toggle-${user.id}`} className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                id={`admin-toggle-${user.id}`} 
                                                className="sr-only peer" 
                                                checked={user.role === 'admin'} 
                                                onChange={() => handleRoleChange(user)}
                                                disabled={currentUser?.id === user.id}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-gold/50 dark:peer-focus:ring-yellow-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-gold peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                                            {currentUser?.id === user.id && <span className="ml-3 text-xs text-gray-400">(You)</span>}
                                        </label>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
             <ConfirmationModal
                isOpen={!!userToDemote}
                onClose={() => setUserToDemote(null)}
                onConfirm={confirmDemotion}
                title={`Demote ${userToDemote?.name}?`}
                confirmButtonText="Confirm Demotion"
                confirmButtonColor="red"
            >
                Are you sure you want to revoke admin privileges for this user? They will be demoted to a regular customer.
            </ConfirmationModal>
        </div>
    );
};
