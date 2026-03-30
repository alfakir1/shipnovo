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
        Schema::table('work_orders', function (Blueprint $table) {
            $table->unsignedBigInteger('driver_id')->nullable()->after('partner_id');
            $table->unsignedBigInteger('vehicle_id')->nullable()->after('driver_id');

            $table->foreign('driver_id')->references('id')->on('driver_profiles')->onDelete('set null');
            $table->foreign('vehicle_id')->references('id')->on('vehicles')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropForeign(['driver_id']);
            $table->dropForeign(['vehicle_id']);
            $table->dropColumn(['driver_id', 'vehicle_id']);
        });
    }
};
