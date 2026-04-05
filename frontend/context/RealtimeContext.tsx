
import React, { createContext, useContext, useEffect, useRef } from 'react';

type RealtimeEvent = 
    | { type: 'ORDER_CREATED'; payload: any }
    | { type: 'ORDER_UPDATED'; payload: any };

interface RealtimeContextType {
    emit: (event: RealtimeEvent) => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode; onEvent?: (event: RealtimeEvent) => void }> = ({ children, onEvent }) => {
    const channelRef = useRef<BroadcastChannel | null>(null);

    useEffect(() => {
        // Initialize BroadcastChannel
        const channel = new BroadcastChannel('ezooze_realtime');
        channelRef.current = channel;

        channel.onmessage = (messageEvent) => {
            const event = messageEvent.data as RealtimeEvent;
            console.log('Realtime Event Received:', event);
            if (onEvent) {
                onEvent(event);
            }
        };

        return () => {
            channel.close();
        };
    }, [onEvent]);

    const emit = (event: RealtimeEvent) => {
        // 1. Broadcast to other tabs
        if (channelRef.current) {
            channelRef.current.postMessage(event);
        }
        // 2. Handle locally (so the tab that triggered it also updates)
        if (onEvent) {
            onEvent(event);
        }
    };

    return (
        <RealtimeContext.Provider value={{ emit }}>
            {children}
        </RealtimeContext.Provider>
    );
};

export const useRealtime = () => {
    const context = useContext(RealtimeContext);
    if (context === undefined) {
        throw new Error('useRealtime must be used within a RealtimeProvider');
    }
    return context;
};
