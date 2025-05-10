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
        Schema::create('animal_photos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('animal_id');
            $table->string('image_path',255);
            $table->timestamp('uploaded_at')->useCurrent();
            $table->foreign('animal_id')->references('id')->on('animals')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('animal_photos');
    }
};
