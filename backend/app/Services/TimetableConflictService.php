<?php

namespace App\Services;

use App\Models\TimetableEntry;

class TimetableConflictService
{
    /**
     * Returns a list of human-readable conflict descriptions for a proposed
     * timetable entry. An empty array means the slot is free.
     */
    public function findConflicts(
        int $schoolClassId,
        int $teacherId,
        int $dayOfWeek,
        string $startTime,
        string $endTime,
        ?string $room = null,
        ?int $excludingEntryId = null,
    ): array {
        $overlapping = TimetableEntry::query()
            ->where('day_of_week', $dayOfWeek)
            ->where('start_time', '<', $endTime)
            ->where('end_time', '>', $startTime)
            ->when($excludingEntryId, fn ($query) => $query->whereKeyNot($excludingEntryId))
            ->get();

        $conflicts = [];

        foreach ($overlapping as $entry) {
            if ($entry->school_class_id === $schoolClassId) {
                $conflicts[] = "Class already has a lesson scheduled from {$entry->start_time} to {$entry->end_time} on this day.";
            }

            if ($entry->teacher_id === $teacherId) {
                $conflicts[] = "Teacher is already assigned to another class from {$entry->start_time} to {$entry->end_time} on this day.";
            }

            if ($room !== null && $entry->room !== null && $entry->room === $room) {
                $conflicts[] = "Room \"{$room}\" is already booked from {$entry->start_time} to {$entry->end_time} on this day.";
            }
        }

        return $conflicts;
    }
}
