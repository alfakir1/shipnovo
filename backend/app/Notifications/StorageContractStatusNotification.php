<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StorageContractStatusNotification extends Notification
{
    use Queueable;

    protected $contract;
    protected $status;

    /**
     * Create a new notification instance.
     */
    public function __construct($contract, $status)
    {
        $this->contract = $contract;
        $this->status = $status;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database']; // Keeping it simple for now as per plan
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $warehouseName = $this->contract->warehouse->name ?? 'Facility';
        $title = $this->status === 'active' ? 'Storage Request Approved' : 'Storage Request Update';
        $message = $this->status === 'active' 
            ? "Your storage request for {$warehouseName} has been approved. You can now start managing your inventory." 
            : "There is an update regarding your storage request for {$warehouseName}.";

        return [
            'title' => $title,
            'message' => $message,
            'contract_id' => $this->contract->id,
            'warehouse_id' => $this->contract->warehouse_id,
            'status' => $this->status,
            'type' => 'storage_contract',
            'action_url' => '/customer/inventory',
        ];
    }
}
