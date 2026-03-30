<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SystemNotification extends Notification
{
    use Queueable;

    protected $title;
    protected $message;
    protected $type;
    protected $context;

    /**
     * Create a new notification instance.
     *
     * @param string $title
     * @param string $message
     * @param string $type
     * @param array $context
     */
    public function __construct(string $title, string $message, string $type = 'system_operation', array $context = [])
    {
        $this->title = $title;
        $this->message = $message;
        $this->type = $type;
        $this->context = $context;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        // For system operations, we primarily use database notifications to avoid spamming emails,
        // unless specified otherwise in the future.
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return array_merge([
            'subject' => $this->title,
            'message_snippet' => $this->message,
            'type' => $this->type,
        ], $this->context);
    }
}
