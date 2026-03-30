<?php

namespace App\Http\Controllers\Api;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\Notification;
use App\Notifications\NewMessageNotification;
use App\Notifications\SystemNotification;

class TicketController extends ApiController
{
    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'shipment_id' => 'nullable|exists:shipments,id',
            'message' => 'required|string',
            'priority' => 'nullable|string|in:low,medium,high',
        ]);

        $user = $request->user();

        $ticket = Ticket::create([
            'customer_id' => $user->id,
            'shipment_id' => $request->shipment_id,
            'subject' => $request->subject,
            'status' => 'open',
            'priority' => $request->priority ?? 'medium',
        ]);

        $message = $ticket->messages()->create([
            'sender_id' => $user->id,
            'sender_role' => $user->role,
            'message' => $request->message,
        ]);

        // Notify Admins/Ops
        $adminsAndOps = User::whereIn('role', ['admin', 'ops'])->get();
        Notification::send($adminsAndOps, new SystemNotification(
            'New Ticket: ' . $ticket->subject,
            'A new ticket was opened by ' . $user->name,
            'system_operation',
            ['ticket_id' => $ticket->id]
        ));

        return ApiResponse::created($ticket->load(['messages', 'shipment']));
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $query = Ticket::with(['shipment', 'creator']);

        if ($user->role === 'customer') {
            $query->where('customer_id', $user->id);
        } elseif ($user->role === 'partner') {
            $query->whereHas('shipment.assignments.partner', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }
        // Ops/Admin see all

        // Eager load the latest message for displaying in lists
        $query->with(['messages' => function ($q) {
            $q->latest()->limit(1);
        }]);

        // Sort by most recently updated
        $tickets = $query->orderBy('updated_at', 'desc')->paginate(15);
        
        return ApiResponse::ok($tickets);
    }

    public function show($id, Request $request)
    {
        $ticket = Ticket::with(['messages.sender', 'shipment'])->findOrFail($id);
        // Simplified auth check
        return ApiResponse::ok($ticket);
    }

    public function getChat($shipmentId, Request $request)
    {
        $ticket = Ticket::firstOrCreate(
            ['shipment_id' => $shipmentId],
            [
                // If it's a customer, use their ID for created_by / customer_id if applicable.
                'customer_id' => $request->user()->id,
                'subject' => 'Shipment Chat Thread',
                'status' => 'open'
            ]
        );

        $ticket->load(['messages.sender']);
        return ApiResponse::ok($ticket);
    }

    public function postChat($shipmentId, Request $request)
    {
        $shipment = \App\Models\Shipment::findOrFail($shipmentId);
        
        $ticket = Ticket::firstOrCreate(
            ['shipment_id' => $shipmentId],
            [
                'customer_id' => $shipment->customer_id, // Link to the actual shipment customer
                'subject' => 'Shipment Chat Thread',
                'status' => 'open'
            ]
        );

        $request->validate(['message' => 'required|string']);

        $message = $ticket->messages()->create([
            'sender_id' => $request->user()->id,
            'sender_role' => $request->user()->role,
            'message' => $request->message,
        ]);

        $ticket->touch();

        $this->notifyRecipients($ticket, $request->user(), $request->message);

        return ApiResponse::created($message->load('sender'));
    }

    public function postMessage($ticketId, Request $request)
    {
        $ticket = Ticket::findOrFail($ticketId);

        $request->validate(['message' => 'required|string']);

        $message = $ticket->messages()->create([
            'sender_id' => $request->user()->id,
            'sender_role' => $request->user()->role,
            'message' => $request->message,
        ]);

        $ticket->touch();

        $this->notifyRecipients($ticket, $request->user(), $request->message);

        return ApiResponse::created($message->load('sender'));
    }

    public function postComment($ticketId, Request $request)
    {
        $ticket = Ticket::findOrFail($ticketId);

        $request->validate(['body' => 'required|string']);

        $message = $ticket->messages()->create([
            'sender_id' => $request->user()->id,
            'sender_role' => $request->user()->role,
            'message' => $request->body,
        ]);

        $ticket->touch();

        $this->notifyRecipients($ticket, $request->user(), $request->body);

        return ApiResponse::created($message->load('sender'));
    }

    /**
     * Notify the appropriate recipients about a new message.
     */
    protected function notifyRecipients(Ticket $ticket, $sender, $messageContent)
    {
        $recipients = collect();

        // If the sender is NOT an admin/ops, notify admin/ops
        if (!in_array($sender->role, ['admin', 'ops'])) {
            $recipients = $recipients->merge(User::whereIn('role', ['admin', 'ops'])->get());
        }

        // If the sender is NOT the customer, notify the customer
        if ($sender->id !== $ticket->customer_id && $ticket->customer) {
            $recipients->push($ticket->customer);
        }

        // Ensure unique recipients
        $recipients = $recipients->unique('id');

        // Filter out the sender themselves (just in case)
        $recipients = $recipients->filter(fn($u) => $u->id !== $sender->id);

        if ($recipients->isNotEmpty()) {
            Notification::send(
                $recipients, 
                new NewMessageNotification($ticket, $sender, $messageContent)
            );
        }
    }
}
