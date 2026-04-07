

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
    const colorConfigs: Record<OrderStatus, { text: string, bg: string, border: string }> = {
        'Confirmed': { text: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
        'Processing': { text: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' },
        'Packing': { text: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
        'Shipped': { text: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
        'Out for Delivery': { text: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
        'Delivered': { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
        'Cancelled': { text: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
        'Refunded': { text: 'text-zinc-400', bg: 'bg-zinc-400/10', border: 'border-zinc-400/20' },
    };
    const config = colorConfigs[status] || colorConfigs['Confirmed'];
    return (
        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm ${config.text} ${config.bg} ${config.border}`}>
            {status}
        </span>
    );
};

const OrderCard: React.FC<{ order: Order, onDragStart: (e: React.DragEvent<HTMLDivElement>, order: Order) => void, onClick: () => void }> = ({ order, onDragStart, onClick }) => (
    <div
        draggable
        onDragStart={(e) => onDragStart(e, order)}
        onClick={onClick}
        className="glass-card hover-glow p-5 rounded-2xl transition-luxury group cursor-grab active:cursor-grabbing mb-4 border border-white/5 relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 w-20 h-20 bg-brand-gold/5 rounded-full blur-2xl -z-10 transition-colors group-hover:bg-brand-gold/10"></div>
        <div className="flex justify-between items-start mb-4">
            <p className="font-black text-[11px] text-brand-gold tracking-widest uppercase">{order.id}</p>
            <StatusBadge status={order.status} />
        </div>
        <p className="text-sm font-bold text-white group-hover:text-brand-gold transition-luxury mb-1">{order.customerName}</p>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{new Date(order.date).toLocaleDateString()}</p>
        <div className="flex justify-between items-center mt-6 border-t border-white/5 pt-4">
             <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Valuation</p>
             <p className="text-base font-black text-white">Rs. {order.total.toLocaleString()}</p>
        </div>
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
    const boardColumns: { id: KanbanColumnId, title: string, subtitle: string }[] = [
        { id: 'New', title: 'Pending Approval', subtitle: 'Recent Acquisitions' },
        { id: 'InProgress', title: 'Operational', subtitle: 'Packing & Fulfillment' },
        { id: 'OnTheWay', title: 'Transit Logistics', subtitle: 'Dispatch Flow' },
        { id: 'Done', title: 'Completed', subtitle: 'Successful Deliveries' },
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

        let targetStatus: OrderStatus;
        switch (targetColumn) {
            case 'New': targetStatus = 'Confirmed'; break;
            case 'InProgress': targetStatus = 'Processing'; break;
            case 'OnTheWay': targetStatus = 'Shipped'; break;
            case 'Done': targetStatus = 'Delivered'; break;
            default: return;
        }

        if (targetColumn === 'OnTheWay') {
            setOrderToView({ ...draggedOrder, status: 'Shipped' });
        } else {
             const updatedOrder: Order = {
                 ...draggedOrder,
                 status: targetStatus,
                 statusHistory: [...(draggedOrder.statusHistory || []), { status: targetStatus, timestamp: new Date().toISOString(), note: 'Moved via Command Center Board' }]
             };

            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
            addNotification(`Order #${updatedOrder.id} successfully transitioned to ${targetStatus}.`, 'info');
        }
        setDraggedOrder(null);
    };

    const handleSaveOrder = (updatedOrder: Order) => {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        setOrderToView(null);
        addNotification(`Order #${updatedOrder.id} status updated to ${updatedOrder.status}.`, 'success');
    };

    const ViewSwitcher = () => (
        <div className="flex items-center gap-1 p-1.5 glass-panel rounded-2xl ml-4 bg-white/5">
            <button 
                onClick={() => setViewMode('board')} 
                className={`p-2.5 rounded-xl transition-luxury group ${viewMode === 'board' ? 'bg-brand-gold text-white shadow-lg shadow-brand-gold/20' : 'text-zinc-500 hover:text-white'}`}
            >
                <ViewColumnsIcon className="h-4 w-4"/>
            </button>
            <button 
                onClick={() => setViewMode('list')} 
                className={`p-2.5 rounded-xl transition-luxury group ${viewMode === 'list' ? 'bg-brand-gold text-white shadow-lg shadow-brand-gold/20' : 'text-zinc-500 hover:text-white'}`}
            >
                <TableCellsIcon className="h-4 w-4"/>
            </button>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Control Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex-1 w-full lg:max-w-2xl flex flex-col sm:flex-row gap-4">
                    <div className="relative group flex-1">
                        <div className="flex items-center glass-panel rounded-2xl px-4 py-2 group-focus-within:ring-2 ring-brand-gold/30 transition-luxury bg-white/5">
                            <NoSymbolIcon className="h-4 w-4 text-zinc-500 group-focus-within:text-brand-gold transition-colors rotate-90"/>
                            <input 
                                type="text" 
                                placeholder="Locate specific order protocol..." 
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="ml-3 bg-transparent border-none text-sm text-white placeholder-zinc-400 focus:outline-none w-full"
                            />
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center">
                    {viewMode === 'list' && (
                        <div className="glass-panel px-4 py-2 rounded-2xl bg-white/5 border border-white/5">
                            <select
                                value={statusFilter}
                                onChange={e => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
                                className="bg-transparent text-xs font-bold text-zinc-300 uppercase tracking-widest focus:outline-none cursor-pointer"
                            >
                                <option value="all">Comprehensive Status</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Processing">Processing</option>
                                <option value="Packing">Packing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Refunded">Refunded</option>
                            </select>
                        </div>
                    )}
                    <ViewSwitcher />
                </div>
            </div>

            {viewMode === 'board' ? (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 h-full overflow-x-auto pb-10 custom-scrollbar">
                        {boardColumns.map(({ id, title, subtitle }) => (
                            <div key={id} className="min-w-[320px] flex flex-col group" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, id)}>
                                <div className="mb-6 px-4">
                                    <h2 className="font-serif text-xl font-bold text-white tracking-wide flex items-center justify-between">
                                        {title} 
                                        <span className="text-[10px] font-black text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/20">{ordersByColumn[id].length}</span>
                                    </h2>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-1">{subtitle}</p>
                                </div>
                                <div className="flex-1 p-3 glass-panel rounded-[2rem] bg-white/[0.02] border-white/5 min-h-[500px] max-h-[70vh] overflow-y-auto custom-scrollbar group-hover:border-brand-gold/20 transition-luxury">
                                    {ordersByColumn[id].map(order => (
                                        <OrderCard key={order.id} order={order} onDragStart={handleDragStart} onClick={() => setOrderToView(order)} />
                                    ))}
                                    {ordersByColumn[id].length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-20">
                                            <div className="w-12 h-12 rounded-full border border-dashed border-zinc-500 mb-4"></div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Neutral State</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Inactive Orders Section */}
                    <div className="glass-card rounded-[2.5rem] p-10 relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-full h-1 bg-rose-500/30"></div>
                         <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Archived Protocols</h2>
                                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-1">Terminated and Void Transactions</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer group">
                                <input type="checkbox" checked={showCancelled} onChange={() => setShowCancelled(!showCancelled)} className="sr-only peer" />
                                <div className="w-12 h-6 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-zinc-600 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500/20 peer-checked:after:bg-rose-500"></div>
                                <span className="ml-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest group-hover:text-white transition-colors">Toggle Visibility</span>
                            </label>
                         </div>
                         
                        {showCancelled && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-500">
                                {inactiveOrders.length > 0 ? inactiveOrders.map(order => (
                                     <div key={order.id} onClick={() => setOrderToView(order)} className="glass-panel p-5 rounded-2xl border-l-2 border-rose-500/40 hover:bg-white/5 cursor-pointer transition-luxury">
                                        <div className="flex justify-between items-center mb-3">
                                            <p className="font-black text-[10px] text-zinc-500 tracking-widest uppercase">{order.id}</p>
                                            <StatusBadge status={order.status} />
                                        </div>
                                        <p className="text-sm font-bold text-zinc-400 truncate">{order.customerName}</p>
                                     </div>
                                )) : <p className="text-sm text-zinc-600 italic font-serif p-10 text-center col-span-full">No archived logs found.</p>}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-white/5">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl -z-10"></div>
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left">
                                 <thead>
                                    <tr className="glass-panel text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                        <th className="px-8 py-6">Protocol ID</th>
                                        <th className="px-6 py-6">Acquisition Date</th>
                                        <th className="px-6 py-6">Client Identity</th>
                                        <th className="px-6 py-6">Total Value</th>
                                        <th className="px-6 py-6">Logistics Status</th>
                                        <th className="px-8 py-6 text-right">Analysis</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {paginatedOrders.map(order => (
                                        <tr key={order.id} className="group hover:bg-white/5 transition-luxury">
                                            <td className="px-8 py-6">
                                                <span className="font-serif font-black text-brand-gold tracking-widest text-xs uppercase">{order.id}</span>
                                            </td>
                                            <td className="px-6 py-6 text-sm text-zinc-400 font-medium">
                                                {new Date(order.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-6 text-sm font-bold text-white group-hover:text-brand-gold transition-luxury">
                                                {order.customerName}
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className="text-sm font-black text-white">Rs. {order.total.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-6"><StatusBadge status={order.status} /></td>
                                            <td className="px-8 py-6 text-right">
                                                <button onClick={() => setOrderToView(order)} className="px-6 py-2.5 glass-panel rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-brand-gold hover:bg-brand-gold/10 hover:border-brand-gold/30 transition-luxury">
                                                    Full Audit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-6 mt-12">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-4 glass-panel rounded-2xl text-gray-500 hover:text-brand-gold disabled:opacity-20 transition-luxury"
                            >
                                <ChevronLeftIcon className="h-5 w-5"/>
                            </button>
                            <div className="px-8 py-3 glass-panel rounded-2xl bg-white/5">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">Section {currentPage} <span className="text-zinc-600 mx-2">/</span> {totalPages}</span>
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-4 glass-panel rounded-2xl text-gray-500 hover:text-brand-gold disabled:opacity-20 transition-luxury"
                            >
                                <ChevronRightIcon className="h-5 w-5"/>
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