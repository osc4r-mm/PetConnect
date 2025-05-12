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
        Schema::create('scheduled_walks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('request_id');
            $table->unsignedBigInteger('caregiver_id');
            $table->unsignedBigInteger('pet_id');
            $table->smallInteger('day_of_week');
            $table->time('time_slot');
            $table->foreign('request_id')->references('id')->on('requests')->onDelete('cascade');
            $table->foreign('caregiver_id')->references('id')->on('caregivers')->onDelete('cascade');
            $table->foreign('pet_id')->references('id')->on('pets')->onDelete('cascade');
            $table->unique(['request_id', 'caregiver_id', 'pet_id', 'day_of_week', 'time_slot']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scheduled_walks');
    }
};
