export type CategoryId =
  | "command" | "attract" | "sell" | "deliver" | "keep" | "money"
  | "team" | "plan" | "vendors" | "risk" | "system";

export type IconName = CategoryId;

export type Subcategory = { id: string; label: string; blurb: string; hours: string };
export type Category = { id: CategoryId; label: string; icon: IconName; subcategories: Subcategory[] };

const s = (id: string, label: string, blurb: string, hours: string): Subcategory => ({ id, label, blurb, hours });

export const CATEGORIES: Category[] = [
  { id: "command", label: "Command center", icon: "command", subcategories: [
    s("home", "See your day", "Your business at a glance: what came in, what needs you, and the next step.", "Core"),
    s("inbox", "Handle what needs you", "Every message and every decision from every part of your business, in one place.", "Core"),
    s("alerts", "Get alerted", "The moments a number crosses a line you set, raised as soon as they happen.", "About 1 hour a week"),
  ]},
  { id: "attract", label: "Marketing", icon: "attract", subcategories: [
    s("content", "Create content", "Pages, posts and articles drafted from what your business knows, published on a schedule.", "2 to 4 hours a week"),
    s("social", "Post on social", "A steady daily presence on your channels, drafted from your approved content.", "2 to 3 hours a week"),
    s("ads", "Run ads", "Paid campaigns with tracking proven end to end and a daily check against your guardrails.", "1 to 3 hours a week"),
    s("referrals", "Get referrals", "Partners and referrers tracked, credited, and thanked on time.", "1 to 3 hours a week"),
    s("events", "Host events", "Webinars and events from registration to reminders, replays and follow-up.", "2 to 5 hours a week"),
  ]},
  { id: "sell", label: "Sales", icon: "sell", subcategories: [
    s("leads", "Capture leads", "Every inquiry captured and answered quickly, with the next action set.", "2 to 4 hours a week"),
    s("pipeline", "Follow up and close", "Every open deal with its stage, its next step, and a nudge when it stalls.", "1 to 3 hours a week"),
    s("proposals", "Send proposals", "Scoped prices and proposals drafted from your discovery notes.", "2 to 5 hours a week"),
    s("checkout", "Take payment", "Payments taken and recorded, matched to the client and the offer.", "1 to 2 hours a week"),
    s("contracts", "Sign contracts", "Agreements from your templates, tracked to signature and renewal.", "1 to 3 hours a week"),
  ]},
  { id: "deliver", label: "Delivery", icon: "deliver", subcategories: [
    s("booking", "Book appointments", "Bookings recorded, confirmed and reminded, with reschedules and attendance handled.", "3 to 7 hours a week"),
    s("projects", "Run projects", "The work your clients pay for, tracked from kickoff to delivery with status updates.", "4 to 10 hours a week"),
    s("programs", "Run programs", "Courses and cohorts: enrollment, curriculum and progress in one place.", "3 to 8 hours a week"),
    s("orders", "Fulfill orders", "Orders, fulfillment updates and stock counts kept in step.", "2 to 5 hours a week"),
  ]},
  { id: "keep", label: "Customer care", icon: "keep", subcategories: [
    s("support", "Answer customers", "One queue for every channel, answers drafted from your knowledge base.", "3 to 5 hours a week"),
    s("client-success", "Keep clients happy", "Check-ins, health signals and renewals handled before anyone has to ask.", "2 to 4 hours a week"),
    s("community", "Run a community", "Welcomes, member questions and a calm, well-kept space.", "2 to 6 hours a week"),
    s("reviews", "Collect reviews", "Reviews asked for at the right moment, replies drafted, testimonials kept with consent.", "1 to 3 hours a week"),
  ]},
  { id: "money", label: "Finance", icon: "money", subcategories: [
    s("invoicing", "Invoice and collect", "Invoices drafted from the work, sent on your approval, payments matched on arrival.", "1 to 3 hours a week"),
    s("books", "Keep the books", "Transactions categorized, receipts matched, and the month prepared for close.", "2 to 4 hours a week"),
    s("bills", "Pay bills", "Bills filed for your approval as they arrive, renewals flagged ahead of time.", "1 to 3 hours a week"),
    s("pay-prep", "Prepare payroll", "Hours and changes compiled for each pay period, ready for your payroll provider.", "1 to 2 hours a week"),
  ]},
  { id: "team", label: "People", icon: "team", subcategories: [
    s("people", "Manage your team", "Your team's roster, schedule and time off in one place.", "1 to 3 hours a week"),
    s("hiring", "Hire", "Job posts, applicants and interviews organized, every decision left to you.", "1 to 3 hours a week"),
    s("tasks", "Assign work", "Hand-offs, team tasks and the how-we-do-it library your team can search.", "2 to 5 hours a week"),
  ]},
  { id: "plan", label: "Leadership", icon: "plan", subcategories: [
    s("scorecard", "Track your numbers", "The weekly numbers that matter, pulled automatically, with a line for each.", "About 1 hour a week"),
    s("priorities", "Set priorities", "Quarterly priorities with owners and the weekly meeting prepared before it starts.", "About 1 hour a week"),
    s("reports", "Get reports", "Monthly and quarterly reviews written from your own records.", "1 to 2 hours a week"),
  ]},
  { id: "vendors", label: "Operations", icon: "vendors", subcategories: [
    s("vendors", "Manage suppliers", "Every tool and supplier you pay, with renewals watched and spend reviewed.", "1 to 2 hours a week"),
    s("stock", "Track stock", "Reorder points and draft purchase orders when stock runs low.", "1 to 2 hours a week"),
    s("equipment", "Maintain equipment", "Equipment and facilities with maintenance on a schedule.", "About 1 hour a week"),
  ]},
  { id: "risk", label: "Protection", icon: "risk", subcategories: [
    s("compliance", "Stay compliant", "Every filing, license and renewal on one calendar, with a prep packet ahead of each.", "1 to 3 hours a week"),
    s("access", "Control access", "Who can get into what, with joiners and leavers handled by checklist.", "About 1 hour a week"),
    s("backups", "Back up your data", "Backups proven on a schedule and one switch that pauses everything.", "About 1 hour a month"),
  ]},
  { id: "system", label: "Settings", icon: "system", subcategories: [
    s("connections", "Connect your tools", "Every service your business uses, connected once and known to every module.", "Core"),
    s("modules", "Add capabilities", "What is running in your command center and what you can add next.", "Core"),
    s("setup", "Set up", "Your stack, step by step: what is live, and what each next step unlocks.", "Core"),
    s("users", "Users", "Your team's accounts, roles and what each person can see.", "Core"),
    s("settings", "Preferences", "Your business profile and how your command center behaves.", "Core"),
    s("requests", "Requests", "Everything you have asked Light Brands to build, with its status.", "Core"),
  ]},
];
