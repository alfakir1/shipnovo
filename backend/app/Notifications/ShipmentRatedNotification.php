<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ShipmentRatedNotification extends Notification
{
    use Queueable;

    protected $shipment;
    protected $score;
    protected $comment;
    protected $suggestions;
    protected $customer;

    public function __construct($shipment, $score, $comment, $suggestions, $customer)
    {
        $this->shipment = $shipment;
        $this->score = $score;
        $this->comment = $comment;
        $this->suggestions = $suggestions;
        $this->customer = $customer;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Rating: ' . $this->shipment->tracking_number . ' - ' . $this->score . ' Stars')
            ->line('Customer ' . $this->customer->name . ' has rated shipment ' . $this->shipment->tracking_number)
            ->line('Score: ' . $this->score . ' / 5')
            ->line('Comment: ' . $this->comment)
            ->line('Suggestions: ' . $this->suggestions)
            ->action('View Shipment', url('/ops/shipments/' . $this->shipment->id))
            ->line('Thank you for using our application!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'shipment_rated',
            'shipment_id' => $this->shipment->id,
            'tracking_number' => $this->shipment->tracking_number,
            'score' => $this->score,
            'comment' => $this->comment,
            'suggestions' => $this->suggestions,
            'customer_name' => $this->customer->name,
        ];
    }
}
