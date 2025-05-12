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
        Schema::create('caregiver_availability', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('caregiver_id');
            $table->smallInteger('day_of_week');
            $table->time('time_slot');
            $table->unique(['caregiver_id','day_of_week','time_slot']);
            $table->foreign('caregiver_id')->references('id')->on('caregivers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('caregiver_availability');
    }
};
