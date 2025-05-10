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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('owner_id');
            $table->unsignedBigInteger('caregiver_id');
            $table->decimal('amount',10,2);
            $table->timestamp('paid_at')->useCurrent()->useCurrentOnUpdate();
            $table->foreign('owner_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('caregiver_id')->references('id')->on('caregivers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
