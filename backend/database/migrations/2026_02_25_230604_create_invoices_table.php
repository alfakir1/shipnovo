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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipment_id')->constrained()->onDelete('cascade');
            $table->foreignId('issued_by_user_id')->nullable()->constrained('users');
            $table->string('invoice_number')->unique()->nullable();
            $table->decimal('amount', 12, 2);
            $table->string('currency')->default('USD');
            $table->date('due_date')->nullable();
            $table->string('status')->default('unpaid'); // unpaid, paid, overdue, cancelled
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
