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
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_number')->unique();
            $table->foreignId('customer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('created_by')->constrained('users');
            $table->string('status')->default('pending'); // pending, processing, transit, customs, delivered, cancelled
            $table->string('origin');
            $table->string('destination');
            $table->decimal('total_weight', 10, 2)->nullable();
            $table->string('weight_unit')->default('kg');
            $table->decimal('internal_value', 12, 2)->nullable();
            $table->integer('pallet_count')->default(1);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
