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
        Schema::create('debts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('owner_id');
            $table->unsignedBigInteger('caregiver_id');
            $table->decimal('amount_due',10,2)->default(0);
            $table->timestamp('last_updated')->useCurrent()->useCurrentOnUpdate();
            $table->unique(['owner_id','caregiver_id']);
            $table->foreign('owner_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('caregiver_id')->references('id')->on('caregivers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('debts');
    }
};
