<?php

use Illuminate\Support\Facades\Route;

// routes/web.php
Route::get('/{any}', function () {
    return view('app'); // resources/views/app.blade.php (loads your React bundle)
})->where('any', '.*');


require __DIR__.'/auth.php';
