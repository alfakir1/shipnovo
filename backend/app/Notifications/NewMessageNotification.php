<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewMessageNotification extends Notification
{
    use Queueable;

    protected $ticket;
    protected $sender;
    protected $messageContent;

    /**
     * Create a new notification instance.
     */
    public function __construct($ticket, $sender, $messageContent)
    {
        $this->ticket = $ticket;
        $this->sender = $sender;
        $this->messageContent = $messageContent;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Message on Ticket #' . $this->ticket->id)
            ->line('You have received a new message from ' . $this->sender->name)
            ->line('"' . \Illuminate\Support\Str::limit($this->messageContent, 50) . '"')
            ->action('View Ticket', url('/tickets/' . $this->ticket->id))
            ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'ticket_id' => $this->ticket->id,
            'subject' => $this->ticket->subject,
            'sender_id' => $this->sender->id,
            'sender_name' => $this->sender->name,
            'message_snippet' => \Illuminate\Support\Str::limit($this->messageContent, 50),
            'type' => 'new_message',
        ];
    }
}
