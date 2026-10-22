# UoR Attendance — Biotechnology Department

Attendance PWA for the University of Raparin, Biotechnology Department.
Built for **all four study years**, morning shift.

**Frontend:** `index.html` (one file, no CDN, works offline) + `config.js` + `sw.js`
**Backend:** `Code.gs` — one Apps Script file bound to the Google Sheet, JSON API only

---

## 1 · Backend (Apps Script)

1. Open the spreadsheet
   `https://docs.google.com/spreadsheets/d/12dRdy1NS-bwROgN7k2jHhk-ugFFec4Kt_Ql8nXtiBzM/`
2. **Extensions → Apps Script**, delete what is there, paste all of `Code.gs`, save.
3. Change `APP_KEY` at the top to your own string (and put the same string in `config.js`).
4. Run **`setup()`** once and approve the permissions.
   It builds every tab, writes the Year 1 timetable from the printed schedule,
   seeds the eight modules with their real hours, and generates a code per teacher.
   *(It removes the leftover English-department tabs: `Attendance_Records`,
   `M-Modules`, `Year2`–`Year4`, `Overload_lessons`. `Year1` is left alone so you can
   copy the student names out of it.)*
   Exports need Drive and Docs permission, so if you are asked to authorise a
   second time when you first export, accept.
5. Run **`installTriggers()`** — keeps the email queue moving.
6. Run **`showCodes()`** — prints the admin code and every teacher code in the log.
7. **Deploy → New deployment → Web app** · Execute as **Me** · Access **Anyone** ·
   copy the `/exec` URL.

> The admin code starts as `Admin@Uor2026`. Change it in
> **Project Settings → Script Properties → `ADMIN_CODE`**.

## 2 · Frontend (GitHub Pages)

1. New repository, e.g. `attendance-bio`.
2. Upload `index.html`, `config.js`, `sw.js`, `manifest.webmanifest`,
   `icon.svg`, `icon-192.png`, `icon-512.png`, `icon-180.png`.
3. Edit **`config.js` only**:

   ```js
   window.UOR_CONFIG = {
     API_URL: 'https://script.google.com/macros/s/.../exec',
     APP_KEY: 'the same string you put in Code.gs'
   };
   ```

4. **Settings → Pages → Deploy from branch → main / (root)**.
5. In the app: **Administrator → Settings → `APP_URL`** = your Pages address.
   The invitation emails and QR codes are built from it.

## Signing in

Two ways, both on the same field:

* **Access code** — the 9-character code from the invitation email. Works offline.
* **University email** — typing a registered address sends a **one-time 6-digit PIN**
  to that inbox; entering it signs you in and the app remembers the account
  afterwards, exactly as a code would.

The department address **`bio.tech@uor.edu.krd`** opens the administrator panel this
way. The admin code still works too. Change or add addresses in
**Settings → `ADMIN_EMAIL`** (comma-separate several).

Why a PIN and not the address alone: an email address is public — colleagues,
students and anyone on a mailing list know it. If typing it were enough to get in,
anyone who knows a lecturer's address could open the attendance of every student.
Sending a PIN proves the person can actually read that inbox, which is what makes
email sign-in safe. The PIN lasts 10 minutes, dies after five wrong guesses, and can
be used once.

`ALLOWED_EMAIL_DOMAIN` (default `uor.edu.krd`) limits email sign-in to university
addresses. A teacher whose registered address is a personal one simply uses their
code instead — or clear the setting to allow any registered address. Unknown
addresses get the same reply as known ones, so the form cannot be used to find out
who is registered. PIN emails count toward the daily email quota.

### About the URL and safety

A browser has to know where to send its requests, so the `/exec` address cannot be
kept secret from anyone who opens the page source — moving it to `config.js` makes
it tidier to change, not hidden. What actually protects the data:

* **Every action needs a valid code** (or a verified email sign-in, which hands the
  app that same code). No action returns student data without one.
* **`APP_KEY`** — a shared string the page sends with each request. It stops bots
  that scan for open Apps Script endpoints. It is not a password.
* **Codes are 9 characters** from a 32-letter alphabet (about 10⁹ combinations).
* **Throttle** — after `MAX_FAILED_LOGINS` wrong codes in 15 minutes (default 25)
  the endpoint refuses sign-ins for everyone until the window passes.
* **Code recovery is rate-limited** to 3 attempts per address per hour and always
  answers the same way, so it cannot be used to discover who is registered.
* **`doGet` returns nothing useful**, so opening the URL in a browser reveals nothing.

If you want more than this, the next real step is Google sign-in (`Session
.getActiveUser()`) with access limited to `@uor.edu.krd` accounts — that removes
codes entirely but requires every teacher to have a university Google account.

## 3 · Adding years, students and teachers

* **Students** — *Administrator → Students*: pick the year, then paste one per line:
  `Name, email@uor.edu.krd, A`
* **A new year** — add its rows to the `Modules` and `Schedule` tabs with the `Year`
  column set to `Year2` / `Year3` / `Year4`, then import that year's students.
  `addYear2Example()` in `Code.gs` writes a sample pair of rows to copy.
  Groups are read from the students themselves, so a year with groups A/B/C simply
  shows three group buttons.
* **Teachers** — fill their email in the `Teachers` tab, then press
  **Email all teachers**. Each gets a branded email with their code, a one-tap
  sign-in link and a QR code. Lost codes: **“I forgot my code”** on the login screen.
* A teacher who teaches more than one year sees their modules grouped by year.

---

## How attendance is counted

`absence % = absent hours ÷ (weekly hours × 15 weeks) × 100`, per module.

| Year 1 module | h/week | Term total | 1 hour = | 10 % | 15 % |
|---|---|---|---|---|---|
| English Language I | 4 | 60 | 1.67 % | 6 h | 9 h |
| General Biology | 4 | 60 | 1.67 % | 6 h | 9 h |
| Biophysics | 4 | 60 | 1.67 % | 6 h | 9 h |
| Principles of Biotechnology 1 | 4 | 60 | 1.67 % | 6 h | 9 h |
| Organic Chemistry | 4 | 60 | 1.67 % | 6 h | 9 h |
| Academic Debate | 3 | 45 | 2.22 % | 4.5 h | 6.75 h |
| Kurdish Studies | 3 | 45 | 2.22 % | 4.5 h | 6.75 h |
| Computer 1 | 2 | 30 | 3.33 % | 3 h | 4.5 h |
| **Total** | **28** | **420** | | | |

Other years use their own weekly hours from the `Modules` tab — the formula is the
same. Unexcused and excused hours are tracked separately. Defaults (editable in
**Settings**): notice 5 %, warning 8 %, final warning 10 %, deprivation above 10 %
unexcused or 15 % including permits.

## How a session works

1. The teacher opens a module — the app pre-selects the group from the timetable and
   offers **All / A / B** (or whatever groups that year has).
2. Everyone starts **present**. Each student has one cell per teaching hour; tapping
   cycles **P → A → E → L**. A student absent for hour 1 but present for hour 2 is
   recorded exactly that way. Anyone the teacher never touches stays present.
3. **All present** resets the whole list in one tap; tapping an `H1`/`H2` header
   marks that hour for everyone currently shown.
4. Saved on the device at every tap and pushed to the sheet as a **draft** in the
   background. Nothing is lost if the signal drops or the phone locks.
5. **Finalize & send** writes the records and emails the absent students — one email
   per student per session, with their running total and the hours they have left
   before deprivation.
6. A teacher can reopen and correct their own session until midnight; after that only
   the administrator can. Every change goes to `Audit_Logs`.

## Exporting

**Excel** and **Word** buttons sit in the teacher's **Records** view (that module) and
in **Administrator → Report** (any year, any module, or everything). Real `.xlsx` and
`.docx` built on the server and downloaded straight to the device. Word is capped at
600 rows; for anything larger use Excel.

The report itself is **Kurdish only** and has six columns, nothing else:

| ژ | ناوی خوێندکار | قۆناغ | گروپ | وانە | ڕێژەی نائامادەبوون |
|---|---|---|---|---|---|

Excel is written as a right-to-left sheet; Word puts the columns in reverse order so
the table reads right-to-left on the page. Anyone at or past the deprivation line is
shaded red. Students on 0 % are left out — it is an absence report.

Whatever filters are on screen apply to the file: **threshold** (≥5 %, ≥7.5 %, ≥10 %,
above 10 %) and **date range**. With a date range, only absences inside those dates
are counted, but the percentage is still out of the full term's planned hours, so the
number means "how much of the term allowance was used up in this period".

## Updating an installation that already ran

Re-run **`setup()`** after pasting a new `Code.gs`. It never touches existing data —
it only adds the settings rows that are missing (`DEPARTMENT_KU`, `AUDIT_ENABLED`).
Settings rows that already exist keep their old values, so check these two by hand in
the `Settings` tab:

* **`ALLOWED_EMAIL_DOMAIN`** — clear it while testing with a non-university address.
* **`ADMIN_EMAIL`** — whichever address should open the administrator panel. A Script
  Property of the same name overrides the sheet, which is handy while the script is
  still on a personal account.

## Audit log

`Audit_Logs` is off (`AUDIT_ENABLED = false`). It only ever recorded who did what; the
app never reads it, so nothing depends on it. Turn it on in Settings if you ever need
a trail for a dispute.

## Offline

The service worker caches the app shell and the roster is cached on the device, so
attendance can be taken with no internet. Finalized sessions queue locally and are
sent when the connection returns — the home screen shows **“Waiting to be sent”**
while anything is pending.

## Email limits

A personal `@gmail.com` account sends **100 emails a day**; a Workspace account
(`@uor.edu.krd`) **1500**. The queue uses whatever the account has left and sends the
remainder the next day. `QUOTA_RESERVE` keeps a few in hand.

## Sheet tabs

| Tab | What it holds |
|---|---|
| `Students` | StudentID, name, email, **year**, group |
| `Teachers` | name, email, code, role, modules |
| `Modules` | **year**, weekly theory/practical hours, term length |
| `Schedule` | the weekly timetable per year, with each slot's group scope |
| `Sessions` | one row per session held (and its draft while in progress) |
| `Attendance` | only students with an absence — per-hour marks |
| `Permits` | approved excuses; past absences in the window become excused |
| `Settings`, `Audit_Logs`, `Mail_Queue` | configuration, change log, outbox |
