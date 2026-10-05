export type CategoryId =
  | "command" | "attract" | "sell" | "deliver" | "keep" | "money"
  | "team" | "plan" | "vendors" | "risk" | "system";

export type IconName = CategoryId;

export type Subcategory = { id: string; label: string; blurb: string; hours: string };
export type Category = { id: CategoryId; label: string; icon: IconName; subcategories: Subcategory[] };

const s = (id: string, label: string, blurb: string, hours: string): Subcategory => ({ id, label, blurb, hours });

export const CATEGORIES: Category[] = [
  { id: "command", label: "Command", icon: "command", subcategories: [
    s("home", "Home", "Your business at a glance: what came in, what needs you, and the next step.", "Core"),
    s("inbox", "Inbox", "Every message and every decision from every part of your business, in one place.", "Core"),
    s("alerts", "Alerts", "The moments a number crosses a line you set, raised as soon as they happen.", "About 1 hour a week"),
  ]},
  { id: "attract", label: "Attract", icon: "attract", subcategories: [
    s("content", "Content", "Pages, posts and articles drafted from what your business knows, published on a schedule.", "2 to 4 hours a week"),
    s("social", "Social", "A steady daily presence on your channels, drafted from your approved content.", "2 to 3 hours a week"),
    s("ads", "Ads", "Paid campaigns with tracking proven end to end and a daily check against your guardrails.", "1 to 3 hours a week"),
    s("referrals", "Referrals", "Partners and referrers tracked, credited, and thanked on time.", "1 to 3 hours a week"),
    s("events", "Events", "Webinars and events from registration to reminders, replays and follow-up.", "2 to 5 hours a week"),
  ]},
  { id: "sell", label: "Sell", icon: "sell", subcategories: [
    s("leads", "Leads", "Every inquiry captured and answered quickly, with the next action set.", "2 to 4 hours a week"),
    s("pipeline", "Pipeline", "Every open deal with its stage, its next step, and a nudge when it stalls.", "1 to 3 hours a week"),
    s("proposals", "Proposals", "Scoped prices and proposals drafted from your discovery notes.", "2 to 5 hours a week"),
    s("checkout", "Checkout", "Payments taken and recorded, matched to the client and the offer.", "1 to 2 hours a week"),
    s("contracts", "Contracts", "Agreements from your templates, tracked to signature and renewal.", "1 to 3 hours a week"),
  ]},
  { id: "deliver", label: "Deliver", icon: "deliver", subcategories: [
    s("booking", "Booking", "Bookings recorded, confirmed and reminded, with reschedules and attendance handled.", "3 to 7 hours a week"),
    s("projects", "Projects", "The work your clients pay for, tracked from kickoff to delivery with status updates.", "4 to 10 hours a week"),
    s("programs", "Programs", "Courses and cohorts: enrollment, curriculum and progress in one place.", "3 to 8 hours a week"),
    s("orders", "Orders", "Orders, fulfillment updates and stock counts kept in step.", "2 to 5 hours a week"),
  ]},
  { id: "keep", label: "Keep", icon: "keep", subcategories: [
    s("support", "Support", "One queue for every channel, answers drafted from your knowledge base.", "3 to 5 hours a week"),
    s("client-success", "Client success", "Check-ins, health signals and renewals handled before anyone has to ask.", "2 to 4 hours a week"),
    s("community", "Community", "Welcomes, member questions and a calm, well-kept space.", "2 to 6 hours a week"),
    s("reviews", "Reviews", "Reviews asked for at the right moment, replies drafted, testimonials kept with consent.", "1 to 3 hours a week"),
  ]},
  { id: "money", label: "Money", icon: "money", subcategories: [
    s("invoicing", "Invoicing", "Invoices drafted from the work, sent on your approval, payments matched on arrival.", "1 to 3 hours a week"),
    s("books", "Books", "Transactions categorized, receipts matched, and the month prepared for close.", "2 to 4 hours a week"),
    s("bills", "Bills", "Bills filed for your approval as they arrive, renewals flagged ahead of time.", "1 to 3 hours a week"),
    s("pay-prep", "Pay prep", "Hours and changes compiled for each pay period, ready for your payroll provider.", "1 to 2 hours a week"),
  ]},
  { id: "team", label: "Team", icon: "team", subcategories: [
    s("people", "People", "Your team's roster, schedule and time off in one place.", "1 to 3 hours a week"),
    s("hiring", "Hiring", "Job posts, applicants and interviews organized, every decision left to you.", "1 to 3 hours a week"),
    s("tasks", "Tasks and manual", "Hand-offs, team tasks and the how-we-do-it library your team can search.", "2 to 5 hours a week"),
  ]},
  { id: "plan", label: "Plan", icon: "plan", subcategories: [
    s("scorecard", "Scorecard", "The weekly numbers that matter, pulled automatically, with a line for each.", "About 1 hour a week"),
    s("priorities", "Priorities", "Quarterly priorities with owners and the weekly meeting prepared before it starts.", "About 1 hour a week"),
    s("reports", "Reports", "Monthly and quarterly reviews written from your own records.", "1 to 2 hours a week"),
  ]},
  { id: "vendors", label: "Vendors and assets", icon: "vendors", subcategories: [
    s("vendors", "Vendors", "Every tool and supplier you pay, with renewals watched and spend reviewed.", "1 to 2 hours a week"),
    s("stock", "Stock", "Reorder points and draft purchase orders when stock runs low.", "1 to 2 hours a week"),
    s("equipment", "Equipment", "Equipment and facilities with maintenance on a schedule.", "About 1 hour a week"),
  ]},
  { id: "risk", label: "Risk", icon: "risk", subcategories: [
    s("compliance", "Compliance", "Every filing, license and renewal on one calendar, with a prep packet ahead of each.", "1 to 3 hours a week"),
    s("access", "Access", "Who can get into what, with joiners and leavers handled by checklist.", "About 1 hour a week"),
    s("backups", "Backups", "Backups proven on a schedule and one switch that pauses everything.", "About 1 hour a month"),
  ]},
  { id: "system", label: "System", icon: "system", subcategories: [
    s("connections", "Connections", "Every service your business uses, connected once and known to every module.", "Core"),
    s("modules", "Modules", "What is running in your command center and what you can add next.", "Core"),
    s("setup", "Setup", "Your stack, step by step: what is live, and what each next step unlocks.", "Core"),
    s("users", "Users and roles", "Your team's accounts, roles and what each person can see.", "Core"),
    s("settings", "Settings", "Your business profile and how your command center behaves.", "Core"),
    s("requests", "Requests", "Everything you have asked Light Brands to build, with its status.", "Core"),
  ]},
];
