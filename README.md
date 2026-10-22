# Attendance — University of Raparin

A small attendance app for a university department: a web app teachers install on
their phone, and a Google Sheet behind it.

> **This repository is public.** Nothing here contains a code, a password, an email
> address, a sheet link or a web-app URL — and nothing you add should. All of those
> live in the Google Sheet and in the Apps Script project, neither of which is public.
> The one exception is `config.js`, which by necessity holds the web-app address; see
> *What is and is not secret* below.

---

## What it does

* Teachers sign in with a personal code, or with their university email and a one-time
  PIN sent to that inbox.
* Attendance is taken per **teaching hour**, so a student absent for one hour of a
  three-hour class is recorded exactly that way.
* Everyone starts present; the teacher only marks the exceptions.
* Absence percentages are calculated per module against the planned hours for the term.
* Works with no internet in the classroom and sends the records when the signal returns.
* Reports export to Excel and Word in Kurdish.

## Files

| File | What it is |
|---|---|
| `index.html` | the whole front end — no framework, no CDN |
| `config.js` | the two connection values you fill in after deploying |
| `sw.js` | offline support |
| `manifest.webmanifest`, `icon-*.png`, `icon.svg` | installable-app metadata |
| `Code.gs` | the entire backend, pasted into Apps Script |

## Setting it up

**1 — the sheet and the script**

1. Create a blank Google Sheet.
2. In that sheet: **Extensions → Apps Script**. Delete the sample code, paste all of
   `Code.gs`, save.
   Leave `SPREADSHEET_ID` empty — the script then always uses the sheet it is attached
   to, so it can never read the wrong file.
3. Change `APP_KEY` near the top to a string of your own.
4. Run `setup()` once and approve the permissions.
5. Run `installTriggers()` once.
6. Run `showCodes()` and copy the codes it prints. **Keep them out of this repository.**
7. **Deploy → New deployment → Web app**, *Execute as* **Me**, *Who has access*
   **Anyone**. Copy the `/exec` URL.

**2 — the web app**

1. Put these files in a repository and turn on **Settings → Pages → Deploy from branch**.
2. Fill in `config.js`: the `/exec` URL, and the same `APP_KEY` you chose in step 3.
3. Sign in as administrator and set `APP_URL` in **Settings** to your Pages address —
   the invitation emails and QR codes are built from it.

**3 — the data**

* **Administrator → Students** imports from an Excel or CSV file
  (name · email · year · group · phone) or from pasted lines.
* Teachers go in the `Teachers` tab: name, email, a code, a role, and the module IDs
  they teach, comma separated. The IDs must match the `Modules` tab exactly.
* Year 1 of the current timetable is created by `setup()`. For another year, add its
  rows to `Modules` and `Schedule` with the `Year` column filled in, then import that
  year's students. `addYear2Example()` writes a sample pair of rows to copy.

## When something does not work

Run **`diagnose()`** from the Apps Script editor and read the log. It prints which
spreadsheet the script is actually attached to, how many teachers, modules and
students it can see, which groups exist in which year, and it flags the usual causes:

* a teacher with no code, or with module IDs that do not exist in `Modules`
* a module whose year contains no students, so the roster comes up empty
* the app still showing an old list — the sheet is cached for two minutes; hand edits
  clear it through a trigger, and **Administrator → Settings → Reload data** clears it
  immediately

"Invalid code" almost always means the script is reading a different spreadsheet than
the one you are typing into. `diagnose()` prints the sheet's name and URL on the first
three lines, which settles it in seconds.

## How attendance is counted

`absence % = absent hours ÷ (weekly hours × weeks) × 100`, per module. A 4-hour-a-week
module over a 15-week term is 60 hours, so one missed hour is 1.67 % and the 10 % line
falls at 6 hours. Weekly hours and term length come from the `Modules` tab, so every
year and every module uses its own figures.

Excused and unexcused hours are counted separately. The thresholds — notice, warning,
final warning, and the two deprivation lines — are all in **Settings**.

## Reports

Kurdish only, six columns, nothing else:

| ژ | ناوی خوێندکار | قۆناغ | گروپ | وانە | ڕێژەی نائامادەبوون |
|---|---|---|---|---|---|

Excel is written as a right-to-left sheet; Word reverses the column order so the table
reads right-to-left on the page. Filters for threshold (≥5 %, ≥7.5 %, ≥10 %, above
10 %) and date range apply to the screen and to the exported file alike.

## What is and is not secret

`config.js` holds the web-app address and `APP_KEY`. A browser has to know where to
send its requests, so neither can be hidden from someone who views the page source;
`APP_KEY` only keeps away bots that scan for open Apps Script endpoints. What actually
protects the data:

* every action requires a valid teacher or administrator code
* wrong codes are throttled across the whole endpoint
* email sign-in needs a PIN delivered to that inbox
* `doGet` returns nothing, so opening the address in a browser reveals nothing

**Never put in this repository:** the administrator code, teacher codes, the sheet ID
or link, student or staff names, email addresses, or exported reports. Change
`ADMIN_CODE` from its default in **Project Settings → Script Properties** before the
app is used for real.

## Email

Absence notices and sign-in PINs come from the account that owns the script. A personal
Gmail account sends 100 a day, a Workspace account 1500. Anything that does not fit
today is queued and sent the next morning.
