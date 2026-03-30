import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export function useNotifications() {
    const queryClient = useQueryClient();

    const { data: notifications = [], isLoading, refetch } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const response = await apiClient.get('/notifications');
            return response.data?.data ?? response.data ?? [];
        },
        refetchInterval: 15000, // Poll every 15 seconds
    });

    const markAsRead = useMutation({
        mutationFn: async (id: string) => {
            await apiClient.post(`/notifications/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const markAllAsRead = useMutation({
        mutationFn: async () => {
            await apiClient.post('/notifications/read-all');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const unreadCount = notifications.length;

    return {
        notifications,
        unreadCount,
        isLoading,
        refetch,
        markAsRead: markAsRead.mutate,
        markAllAsRead: markAllAsRead.mutate,
    };
}
