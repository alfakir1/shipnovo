<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReturnRequestedNotification extends Notification
{
    use Queueable;

    protected $shipment;
    protected $reason;
    protected $customer;

    public function __construct($shipment, $reason, $customer)
    {
        $this->shipment = $shipment;
        $this->reason = $reason;
        $this->customer = $customer;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Return Requested: ' . $this->shipment->tracking_number)
            ->line('Customer ' . $this->customer->name . ' has requested a return for shipment ' . $this->shipment->tracking_number)
            ->line('Reason: ' . $this->reason)
            ->action('View Shipment', url('/ops/shipments/' . $this->shipment->id))
            ->line('Thank you for using our application!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'return_requested',
            'shipment_id' => $this->shipment->id,
            'tracking_number' => $this->shipment->tracking_number,
            'customer_name' => $this->customer->name,
            'reason' => $this->reason,
        ];
    }
}
