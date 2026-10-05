# Privacy

- **Keep the build log and the system document in this repository.** Never send them to a service, a chat, a server or another repository. Why: they describe the business, and the member decides who sees that.
- **Never write customer details, business records or secrets into the build log, the system document or anywhere in the Key.** That covers names of customers, email addresses, phone numbers, amounts from real records, PINs, keys and tokens. Why: these files are shared with the member's tools and travel with the repository.
- **Let the privacy check enforce it.** `checkLogText` in `src/lib/key/formats.ts` fails `npm test` when a log holds an email address or a phone number, and `log:sync` runs the same check before it writes. Why: a rule that depends on memory fails on a busy day.
- **Keep business records in the database.** Contacts, cards, bookings and everything else a customer touches live in tables (see `data.md`), and never in `key/`. Why: records change constantly, and a database is where they are protected and backed up.
- **Describe a change by what it does.** Write "reminders go out 24 hours before each session". Leave the customer out of the entry. Why: the point of a log entry is the system, and a name adds risk without adding meaning.
- **Use invented names in examples and tests.** Why: example data in a repository is read by everyone who reads the repository.
