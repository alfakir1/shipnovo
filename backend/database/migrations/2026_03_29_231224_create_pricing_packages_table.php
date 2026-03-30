<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pricing_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('origin');
            $table->string('destination');
            $table->decimal('min_weight', 10, 2);
            $table->decimal('max_weight', 10, 2);
            $table->decimal('price', 10, 2);
            $table->string('currency', 3)->default('USD');
            $table->enum('type', ['system', 'custom'])->default('system');
            $table->foreignId('partner_id')->nullable()->constrained('partners')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pricing_packages');
    }
};
