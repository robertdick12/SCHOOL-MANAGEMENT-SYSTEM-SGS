<?php

namespace App\Models;

use App\Policies\SubjectPolicy;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[UsePolicy(SubjectPolicy::class)]
#[Fillable(['name', 'code'])]
class Subject extends Model
{
    use HasFactory;
}
