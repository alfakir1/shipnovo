<?php

namespace App\Services\Support;

use App\Models\Shipment;
use App\Models\Ticket;
use App\Models\TicketComment;

class TicketsService
{
    public function list(Shipment $shipment)
    {
        return $shipment->tickets()->latest()->get();
    }

    public function create(Shipment $shipment, array $data, $userId)
    {
        return Ticket::create([
            'shipment_id' => $shipment->id,
            'customer_id' => $shipment->customer_id,
            'subject' => $data['subject'],
            'description' => $data['description'] ?? $data['body'] ?? '',
            'status' => 'open',
        ]);
    }

    public function addComment(Ticket $ticket, string $body, $userId)
    {
        return TicketComment::create([
            'ticket_id' => $ticket->id,
            'user_id' => $userId,
            'comment' => $body,
        ]);
    }

    public function resolve(Ticket $ticket)
    {
        $ticket->update(['status' => 'resolved']);
        return $ticket;
    }
}
