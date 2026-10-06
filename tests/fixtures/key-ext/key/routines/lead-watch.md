---
name: Lead watch
agent: front-desk
category: sell
trigger: cron
cron: "0 9 * * *"
app: leads-demo
card_kinds:
  - { kind: lead-waiting, subcategory: leads, label: Leads waiting, decide: done, expires_days: 1, on_lapse: closes }
checks:
  - key: new-leads
    name: New leads waiting
    period: day
    card_kind: lead-waiting
    reads: [leads_demo]
    sql: |
      select count(*) > 0 as raise,
             count(*)::text || ' new leads are waiting' as title,
             coalesce(string_agg(contact_email, ', '), '') as body
        from leads_demo
       where status = 'new' and created_at <= $2::timestamptz
draft:
  handler: src/drafts/lead-watch.ts
  subcommands: [list, save]
---

## Goal
Every morning the owner sees how many new leads are waiting.

## Steps
1. Count the new leads.

## Expected output
At most one card a day.

## Check
A second run on the same day adds no card.

## When blocked
Ask the owner in the Inbox and change nothing.
