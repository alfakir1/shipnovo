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
            $table->boolean('needs_storage')->default(false)->after('status');
            $table->foreignId('warehouse_id')->nullable()->constrained('warehouses')->onDelete('set null')->after('needs_storage');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->dropForeign(['warehouse_id']);
            $table->dropColumn(['needs_storage', 'warehouse_id']);
        });
    }
};
