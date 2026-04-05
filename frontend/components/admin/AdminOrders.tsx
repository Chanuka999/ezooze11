

import React, { useState, useMemo } from 'react';
import { Order, AdminSection, OrderStatus } from '../../types';
import { NotificationType } from '../Notification';
import { OrderDetailModal } from './OrderDetailModal';
import { ChevronLeftIcon, ChevronRightIcon, TableCellsIcon, ViewColumnsIcon, NoSymbolIcon } from '../icons';

interface AdminOrdersProps {
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    addNotification: (message: string, type: NotificationType) => void;
    setActiveSection: (section: AdminSection) => void;
}

const ORDERS_PER_PAGE = 10;

const StatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
    const colorClasses: Record<OrderStatus, string> = {
        'Confirmed': 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
        'Processing': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        'Packing': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        'Shipped': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        'Out for Delivery': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
        'Delivered': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        'Cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        'Refunded': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${colorClasses[status] || colorClasses['Confirmed']}`}>{status}</span>;
};

const OrderCard: React.FC<{ order: Order, onDragStart: (e: React.DragEvent<HTMLDivElement>, order: Order) => void, onClick: () => void }> = ({ order, onDragStart, onClick }) => (
    <div
        draggable
        onDragStart={(e) => onDragStart(e, order)}
        onClick={onClick}
        className="bg-white dark:bg-brand-surface p-4 rounded-lg shadow border dark:border-brand-border cursor-grab active:cursor-grabbing mb-4 transition-shadow hover:shadow-md"
    >
        <div className="flex justify-between items-start">
            <p className="font-bold font-mono text-sm text-gray-900 dark:text-white">{order.id}</p>
            <StatusBadge status={order.status} />
        </div>
        <p className="text-sm mt-2 font-medium text-gray-800 dark:text-gray-200">{order.customerName}</p>
        <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
        <p className="text-right font-semibold mt-2 text-gray-900 dark:text-white">Rs. {order.total.toLocaleString()}</p>
    </div>
);

// Map groups for Kanban
type KanbanColumnId = 'New' | 'InProgress' | 'OnTheWay' | 'Done';
const STATUS_GROUPS: Record<KanbanColumnId, OrderStatus[]> = {
    'New': ['Confirmed'],
    'InProgress': ['Processing', 'Packing'],
    'OnTheWay': ['Shipped', 'Out for Delivery'],
    'Done': ['Delivered'],
};

const getColumnId = (status: OrderStatus): KanbanColumnId | null => {
    for (const [key, statuses] of Object.entries(STATUS_GROUPS)) {
        if (statuses.includes(status)) return key as KanbanColumnId;
    }
    return null;
};

export const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, setOrders, addNotification, setActiveSection }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [orderToView, setOrderToView] = useState<Order | null>(null);
    const [viewMode, setViewMode] = useState<'board' | 'list'>('list');
    const [showCancelled, setShowCancelled] = useState(false);
    const [draggedOrder, setDraggedOrder] = useState<Order | null>(null);

    const activeOrders = useMemo(() => {
        return [...orders].filter(o => o.status !== 'Cancelled' && o.status !== 'Refunded').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [orders]);

    const inactiveOrders = useMemo(() => {
        return [...orders].filter(o => o.status === 'Cancelled' || o.status === 'Refunded').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [orders]);
    
    // --- List View Data & Logic ---
    const filteredListOrders = useMemo(() => {
        const source = showCancelled ? orders : activeOrders;
        return source
            .filter(o => statusFilter === 'all' || o.status === statusFilter)
            .filter(o =>
                o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [orders, activeOrders, searchTerm, statusFilter, showCancelled]);

    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
        return filteredListOrders.slice(startIndex, startIndex + ORDERS_PER_PAGE);
    }, [filteredListOrders, currentPage]);

    const totalPages = Math.ceil(filteredListOrders.length / ORDERS_PER_PAGE);

    // --- Board View Data & Logic ---
    const boardColumns: { id: KanbanColumnId, title: string }[] = [
        { id: 'New', title: 'New' },
        { id: 'InProgress', title: 'In Progress' },
        { id: 'OnTheWay', title: 'On The Way' },
        { id: 'Done', title: 'Done' },
    ];
    
    const ordersByColumn = useMemo(() => {
        const grouped: Record<string, Order[]> = { New: [], InProgress: [], OnTheWay: [], Done: [] };
        activeOrders.forEach(order => {
            const colId = getColumnId(order.status);
            if (colId && grouped[colId]) {
                grouped[colId].push(order);
            }
        });
        return grouped;
    }, [activeOrders]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, order: Order) => {
        setDraggedOrder(order);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetColumn: KanbanColumnId) => {
        e.preventDefault();
        if (!draggedOrder) return;

        const currentColumn = getColumnId(draggedOrder.status);
        if (currentColumn === targetColumn) {
            setDraggedOrder(null);
            return;
        }

        // Determine the default "landing status" for each column
        let targetStatus: OrderStatus;
        switch (targetColumn) {
            case 'New': targetStatus = 'Confirmed'; break;
            case 'InProgress': targetStatus = 'Processing'; break;
            case 'OnTheWay': targetStatus = 'Shipped'; break;
            case 'Done': targetStatus = 'Delivered'; break;
            default: return;
        }

        // If moving to OnTheWay, enforce manual input for tracking
        if (targetColumn === 'OnTheWay') {
            setOrderToView({ ...draggedOrder, status: 'Shipped' });
        } else {
            // Simple move logic
             const updatedOrder: Order = {
                 ...draggedOrder,
                 status: targetStatus,
                 statusHistory: [...(draggedOrder.statusHistory || []), { status: targetStatus, timestamp: new Date().toISOString(), note: 'Moved via Kanban Board' }]
             };

            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
            addNotification(`Order #${updatedOrder.id} moved to ${targetStatus}.`, 'info');
        }
        setDraggedOrder(null);
    };

    const handleSaveOrder = (updatedOrder: Order) => {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        setOrderToView(null);
        addNotification(`Order #${updatedOrder.id} has been updated to ${updatedOrder.status}.`, 'success');
    };

    const ViewSwitcher = () => (
        <div className="flex items-center space-x-1 p-1 bg-gray-200 dark:bg-brand-surface rounded-lg">
            <button onClick={() => setViewMode('board')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'board' ? 'bg-white dark:bg-brand-charcoal shadow-sm' : ''}`}><ViewColumnsIcon className="h-5 w-5"/></button>
            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-brand-charcoal shadow-sm' : ''}`}><TableCellsIcon className="h-5 w-5"/></button>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">Manage and track customer orders.</p>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        placeholder="Search by Order ID or Customer..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full sm:max-w-xs p-2 border border-gray-300 rounded-md dark:bg-brand-surface dark:border-brand-border dark:text-white"
                    />
                    {viewMode === 'list' && (
                        <select
                            value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
                            className="w-full sm:w-auto p-2 border border-gray-300 rounded-md dark:bg-brand-surface dark:border-brand-border dark:text-white"
                        >
                            <option value="all">All Statuses</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Packing">Packing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Refunded">Refunded</option>
                        </select>
                    )}
                    <ViewSwitcher />
                </div>
            </div>

            {viewMode === 'board' ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full overflow-x-auto">
                        {boardColumns.map(({ id, title }) => (
                            <div key={id} className="bg-gray-100 dark:bg-brand-surface rounded-lg min-w-[280px]" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, id)}>
                                <h2 className="font-semibold p-4 border-b dark:border-brand-border flex justify-between items-center">
                                    {title} 
                                    <span className="text-xs font-normal text-gray-500 bg-white dark:bg-brand-charcoal px-2 py-1 rounded-full">{ordersByColumn[id].length}</span>
                                </h2>
                                <div className="p-4 space-y-4 h-[65vh] overflow-y-auto custom-scrollbar">
                                    {ordersByColumn[id].map(order => (
                                        <OrderCard key={order.id} order={order} onDragStart={handleDragStart} onClick={() => setOrderToView(order)} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" checked={showCancelled} onChange={() => setShowCancelled(!showCancelled)} className="h-4 w-4 rounded text-brand-gold focus:ring-brand-gold"/>
                            <span className="text-sm">Show Inactive Orders (Cancelled/Refunded)</span>
                        </label>
                        {showCancelled && (
                            <div className="mt-4 bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-200 dark:border-red-900/30">
                                <h2 className="font-semibold text-red-800 dark:text-red-300 flex items-center mb-4"><NoSymbolIcon className="h-5 w-5 mr-2"/>Inactive Orders</h2>
                                {inactiveOrders.length > 0 ? inactiveOrders.map(order => (
                                     <div key={order.id} onClick={() => setOrderToView(order)} className="bg-white dark:bg-brand-surface p-3 rounded-md shadow-sm border dark:border-brand-border mb-3 cursor-pointer flex justify-between items-center">
                                        <div>
                                            <p className="font-mono text-sm font-medium">{order.id}</p>
                                            <p className="text-xs text-gray-500">{order.customerName}</p>
                                        </div>
                                        <StatusBadge status={order.status} />
                                     </div>
                                )) : <p className="text-sm text-gray-500">No inactive orders.</p>}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <div className="bg-white dark:bg-brand-charcoal rounded-lg shadow-md border border-gray-200 dark:border-brand-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                 <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-900/50 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Order ID</th>
                                        <th scope="col" className="px-6 py-3">Date</th>
                                        <th scope="col" className="px-6 py-3">Customer</th>
                                        <th scope="col" className="px-6 py-3">Total</th>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                        <th scope="col" className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedOrders.map(order => (
                                        <tr key={order.id} className="bg-white dark:bg-brand-charcoal border-b dark:border-brand-border hover:bg-gray-50 dark:hover:bg-gray-600/20">
                                            <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white">{order.id}</td>
                                            <td className="px-6 py-4">{new Date(order.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">{order.customerName}</td>
                                            <td className="px-6 py-4 font-semibold">Rs. {order.total.toLocaleString()}</td>
                                            <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => setOrderToView(order)} className="font-medium text-brand-gold hover:underline">
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {totalPages > 1 && (
                        <div className="mt-6 flex justify-between items-center">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="flex items-center px-4 py-2 text-sm font-medium border rounded-md disabled:opacity-50"
                            >
                                <ChevronLeftIcon className="h-4 w-4 mr-1"/> Previous
                            </button>
                            <span className="text-sm">Page {currentPage} of {totalPages}</span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="flex items-center px-4 py-2 text-sm font-medium border rounded-md disabled:opacity-50"
                            >
                                Next <ChevronRightIcon className="h-4 w-4 ml-1"/>
                            </button>
                        </div>
                    )}
                </>
            )}
            
            {orderToView && (
                <OrderDetailModal
                    isOpen={!!orderToView}
                    onClose={() => setOrderToView(null)}
                    onSave={handleSaveOrder}
                    order={orderToView}
                    setActiveSection={setActiveSection}
                />
            )}
        </div>
    );
};