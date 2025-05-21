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
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('gender_id')->nullable();
            $table->unsignedTinyInteger('age')->nullable();
            $table->string('description', 255)->nullable();
            $table->decimal('wallet_balance',10,2)->default(0);
            $table->decimal('latitude', 10, 6)->nullable();
            $table->decimal('longitude', 10, 6)->nullable();
            $table->string('image')->after('id')->default('storage/default/default_user.jpg');

            $table->foreign('gender_id')->references('id')->on('genders')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('gender_id');
            $table->dropColumn('age');
            $table->dropColumn('description');
            $table->dropColumn('wallet_balance');
            $table->dropColumn('latitude');
            $table->dropColumn('longitude');
            $table->dropColumn('image');
        });
    }
};
