import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface PublicTrackingData {
    tracking_number: string;
    status: string;
    origin: string;
    destination: string;
    pickup_date: string;
    events: {
        title: string;
        description: string;
        created_at: string;
        is_current: boolean;
    }[];
}

export function usePublicTracking(token: string) {
    return useQuery({
        queryKey: ['public-tracking', token],
        queryFn: async () => {
            if (!token) return null;
            const response = await api.get(`/public/track/${token}`);
            return response.data.data as PublicTrackingData;
        },
        enabled: !!token,
        retry: false,
    });
}
