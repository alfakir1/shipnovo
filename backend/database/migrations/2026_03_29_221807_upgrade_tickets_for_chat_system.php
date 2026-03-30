<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add optional shipment_id if lacking or modifying tickets table
        if (Schema::hasTable('tickets')) {
            Schema::table('tickets', function (Blueprint $table) {
                // Ensure shipment_id exists and status
                if (!Schema::hasColumn('tickets', 'shipment_id')) {
                    $table->unsignedBigInteger('shipment_id')->nullable()->after('id');
                }
            });
        }

        Schema::create('ticket_messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ticket_id');
            $table->unsignedBigInteger('sender_id');
            $table->string('sender_role'); // customer, partner, ops, admin
            $table->text('message');
            $table->json('attachments')->nullable();
            $table->timestamps();

            $table->foreign('ticket_id')->references('id')->on('tickets')->onDelete('cascade');
            $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_messages');
    }
};
