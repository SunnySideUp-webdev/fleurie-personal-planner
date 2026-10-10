# Browser data storage

Fleurie persists user data in browser `localStorage`. This document records the current keys and compatibility expectations.

## Storage map

| Key | Owner | Contents |
| --- | --- | --- |
| `planner-today-v2` | Today | Today-only reminders plus quick-journal draft text and image |
| `noa-planner-data-v1` | Planner | Tasks, reminders, and planning goals |
| `noa-calendar-data-v1` | Calendar | Events, focus items and completion, notes, and habit matrix |
| `noa-habits-v1` | Lifestyle | Habit definitions and completion history |
| `noa-habit-categories-v1` | Lifestyle | User-defined habit categories |
| `noa-mood-data-v1` | Lifestyle | Mood entries and notes by local date |
| `noa-routines-data-v1` | Lifestyle | Daily routines, workout routines, active workout state, and fitness profile |
| `noa-studio-data-v1` | Studio | Closet items, saved outfits, canvas placements/elements, inspiration, and occasion tags |
| `noa-today-outfit-v1` | Studio / Today | Explicit outfit assignment, local assigned date, and save timestamp |
| `noa-money-data-v1` | Money | Transactions, category budgets, and savings goals, including optional goal images |
| `noa-journal-data-v1` | Journal | Entries, tags, prompts, and entry canvas items |
| `noa-quick-journal-v1` | Today / Journal | Quick-journal handoff records imported into the Journal provider |
| `noa-lists-data-v1` | Lists | Shopping items, wishlist items, personal lists, and notes |

The `noa-*` prefix is a legacy internal namespace. It must remain stable unless a deliberate migration copies old records to new keys.

## Dates

Date-sensitive features use local `YYYY-MM-DD` keys. Do not derive these keys by slicing a UTC ISO timestamp because that can move a record to the previous or next day in the user's timezone.

ISO timestamps are still appropriate for creation/update metadata when the calendar day is not being selected from the timestamp.

## Images and capacity

Uploaded photos and stickers are stored as data URLs inside the relevant records. This keeps the app serverless, but browser storage is limited and varies by browser.

Code handling uploads should:

- reject or gracefully report storage quota errors;
- avoid unnecessary duplicate image data;
- preserve records that do not contain newer optional image fields; and
- show a fallback when an image is absent or invalid.

## Schema evolution

When a stored type changes:

1. Keep new fields optional when older records can remain valid.
2. Normalize parsed records before rendering them.
3. Preserve unknown-but-valid user records whenever possible.
4. Do not write until hydration is complete.
5. Verify a fresh profile and a profile containing the previous schema.
6. Check Today and other overview surfaces that consume the same data.

## Backup and deletion

Fleurie does not currently provide an in-app export, restore, or cloud-sync feature. Clearing site data, using a temporary browser profile, or changing browsers can remove or isolate all saved information.

Do not commit browser exports or personal planner records to the repository.
