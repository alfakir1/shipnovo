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
        Schema::table('shipments', function (Blueprint $table) {
            $table->string('mode')->default('sea')->after('destination');
            $table->string('service_type')->default('standard')->after('mode');
            $table->decimal('customer_price', 12, 2)->nullable()->after('service_type');
            $table->decimal('volume', 10, 2)->nullable()->after('total_weight');
            $table->string('cargo_type')->default('general')->after('volume');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->dropColumn(['mode', 'service_type', 'customer_price', 'volume', 'cargo_type']);
        });
    }
};
