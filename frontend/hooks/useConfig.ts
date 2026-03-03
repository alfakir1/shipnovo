import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface AppConfig {
    delay_alert_min_events: number;
}

export function useAppConfig() {
    return useQuery({
        queryKey: ['app-config'],
        queryFn: async () => {
            const response = await api.get('/config');
            return response.data.data as AppConfig;
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}
