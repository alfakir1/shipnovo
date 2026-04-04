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
        Schema::table('storage_contracts', function (Blueprint $table) {
            $table->string('cargo_type')->nullable()->after('pricing_model');
            $table->decimal('estimated_volume', 10, 2)->nullable()->after('cargo_type');
            $table->text('notes')->nullable()->after('estimated_volume');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('storage_contracts', function (Blueprint $table) {
            $table->dropColumn(['cargo_type', 'estimated_volume', 'notes']);
        });
    }
};
