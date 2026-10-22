# Setup notes — KEEP THIS FILE OUT OF THE REPOSITORY

Keep it in Google Drive, or on your computer. It is for you, not for GitHub.

---

## 1 · Sheet and script

1. Open the Google Sheet you want to use.
2. **Extensions → Apps Script**, delete the sample, paste all of `Code.gs`, save.
   Leave `SPREADSHEET_ID` empty — the script then always uses the sheet it is attached
   to and can never read the wrong file.
3. Change `APP_KEY` to a string of your own.
4. Run **`setup()`** → approve permissions.
5. Run **`installTriggers()`**.
6. Run **`diagnose()`** — check line 3 is the sheet you expect, and read the warnings.
7. Run **`showCodes()`** to see the admin code and every teacher code.
8. **Deploy → New deployment → Web app**, *Execute as* **Me**, *Who has access*
   **Anyone**. Copy the `/exec` URL.
9. **Project Settings → Script Properties → `ADMIN_CODE`** → change it from the default.

## 2 · Web app

1. Put `index.html`, `config.js`, `sw.js`, `manifest.webmanifest` and the icons in the
   repository; **Settings → Pages → Deploy from branch**.
2. Fill in `config.js`: the `/exec` URL and the same `APP_KEY`.
3. In the app: **Administrator → Settings → `APP_URL`** = the Pages address.

After any change to `Code.gs`: **Deploy → Manage deployments → edit → New version**.

## 3 · Data

The sheet now fills itself in as far as it can:

* **StudentID, SchedID, TeacherID and teacher codes are generated automatically.**
  Leave those columns blank and they appear as soon as you type a name or module.
* **Dropdowns** on Schedule (Year, Day, ModuleID, Type, Scope, Teacher),
  Students (Year, Group, Status), Teachers (Role) and Modules (Year).
* Import students from Excel/CSV in **Administrator → Students**:
  name · email · year · group · phone.
* A teacher's `Modules` column holds module IDs, comma separated, matching the
  `Modules` tab exactly.

For another study year: add rows to `Modules` and `Schedule` with the `Year` column
set, then import that year's students. `addYear2Example()` writes a sample to copy.

## 4 · When something looks wrong

Run **`diagnose()`**. It prints the spreadsheet it is attached to, the tab list, counts
of teachers / modules / students, students per year and per group, and flags:

* students with no StudentID (it fixes them on the spot)
* duplicate StudentIDs
* a teacher with no code, or module IDs that do not exist
* a module whose year contains no students
* whether `ADMIN_CODE` and `APP_KEY` are still the defaults

The sheet is cached for two minutes. Hand edits clear it through a trigger, and
**Administrator → Settings → Reload data** clears it immediately.

## 5 · How the percentage works

`absence % = absent hours ÷ (weekly hours × weeks) × 100`, per module. A 4-hour-a-week
module over 15 weeks is 60 hours, so one hour is 1.67 % and the 10 % line is 6 hours.
Excused and unexcused are counted separately. Thresholds live in **Settings**.

An approved permit (**Administrator → Permits**) marks the student *Permitted* for
those dates. The teacher sees them locked and cannot mark them absent, and the server
enforces the same thing even if a stale page tries.

## 6 · Email

Absence notices and sign-in PINs come from the account that owns the script: 100 a day
on a personal Gmail account, 1500 on a Workspace one. The overflow is queued and sent
the next morning.

## 7 · Never commit

The admin code, teacher codes, the sheet ID or link, student or staff names, email
addresses, exported reports, or this file.
