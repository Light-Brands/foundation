---
name: Lead watch
agent: front-desk
category: sell
trigger: cron
cron: "0 9 * * *"
app: leads-demo
card_kinds:
  - { kind: lead-waiting, subcategory: leads, label: Leads waiting, decide: done, expires_days: 1, on_lapse: closes }
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
