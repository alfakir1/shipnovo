<?php

namespace App\Policies;

use App\Models\Shipment;
use App\Models\User;
use App\Models\Partner;
use Illuminate\Auth\Access\HandlesAuthorization;

class ShipmentPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the shipment.
     */
    public function view(User $user, Shipment $shipment)
    {
        \Log::info('ShipmentPolicy::view debug', ['user_id' => $user->id, 'user_role' => $user->role, 'shipment_customer_id' => $shipment->customer_id]);

        if (in_array($user->role, ['ops', 'admin'])) {
            return true;
        }

        if ($user->role === 'customer') {
            return (string)$user->id === (string)$shipment->customer_id;
        }

        if ($user->role === 'partner') {
            // Partner sees if assigned
            $isAssigned = $shipment->assignments()->whereHas('partner', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->exists();

            if ($isAssigned) return true;

            // Partner sees RFQ only if invited
            if ($shipment->status === 'rfq' || $shipment->status === 'pending') {
                return $shipment->invitations()->whereHas('partner', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })->exists();
            }
        }

        return false;
    }

    /**
     * Determine whether the user can update the shipment.
     */
    public function update(User $user, Shipment $shipment)
    {
        return in_array($user->role, ['ops', 'admin']);
    }

    /**
     * Determine whether the user can select a quote.
     */
    public function selectQuote(User $user, Shipment $shipment)
    {
        return (string)$user->id === (string)$shipment->customer_id || in_array($user->role, ['ops', 'admin']);
    }

    /**
     * Determine whether the user can submit a quote.
     */
    public function submitQuote(User $user, Shipment $shipment)
    {
        if ($user->role !== 'partner') return false;

        $partner = Partner::where('user_id', $user->id)->first();
        if (!$partner || !$partner->is_verified) return false;

        // Cannot quote if already has a quote or if it's no longer in RFQ/Offers Received state
        $allowedStatuses = ['rfq', 'pending', 'offers_received'];
        if (!in_array($shipment->status, $allowedStatuses)) return false;

        return true;
    }

    public function viewDocuments(User $user, Shipment $shipment)
    {
        return $this->view($user, $shipment);
    }

    public function uploadDocument(User $user, Shipment $shipment)
    {
        if (in_array($user->role, ['ops', 'admin'])) return true;
        
        if ($user->role === 'customer') {
            return (string)$user->id === (string)$shipment->customer_id;
        }

        if ($user->role === 'partner') {
            // Only assigned partner can upload documents
            return $shipment->assignments()->whereHas('partner', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->exists();
        }

        return false;
    }

    public function viewTickets(User $user, Shipment $shipment)
    {
        return $this->view($user, $shipment);
    }

    public function createTicket(User $user, Shipment $shipment)
    {
        return $this->view($user, $shipment);
    }

    public function addEvent(User $user, Shipment $shipment)
    {
        if (in_array($user->role, ['ops', 'admin'])) return true;

        if ($user->role === 'partner') {
            // Only assigned partner can add events
            return $shipment->assignments()->whereHas('partner', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->exists();
        }

        return false;
    }

    public function viewInvoice(User $user, Shipment $shipment)
    {
        if (in_array($user->role, ['ops', 'admin'])) return true;
        
        if ($user->role === 'customer') {
             return (string)$user->id === (string)$shipment->customer_id;
        }

        return false; // Partners usually don't see customer invoices unless assigned as billing agent (out of scope for now)
    }
}
