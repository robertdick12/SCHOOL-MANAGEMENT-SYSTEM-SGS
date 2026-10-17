<?php

namespace App\Notifications;

use App\Models\Announcement;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AnnouncementPublished extends Notification
{
    public function __construct(private readonly Announcement $announcement)
    {
    }

    /**
     * Mail only for now — SMS/WhatsApp have no configured provider yet
     * (see App\Services\Messaging). Sent synchronously: nothing in this
     * app is queued, so there's no queue:work process to pick this up.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("New announcement: {$this->announcement->title}")
            ->greeting("Hi {$notifiable->name},")
            ->line($this->announcement->body)
            ->line('Sign in to the portal to see all announcements.')
            ->salutation('— Sovereign Grace School');
    }
}
