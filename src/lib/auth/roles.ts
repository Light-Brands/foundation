// Who is acting, and what their role lets them do. Pure, so scripts and tests use it too.
// Before the hosted database, a valid PIN session is the owner.

export type Role = "owner" | "team";
export type Actor = { id: string; role: Role; via: "pin" | "account"; departments: string[] };

export const PIN_OWNER: Actor = Object.freeze({ id: "pin:owner", role: "owner", via: "pin", departments: Object.freeze([]) as unknown as string[] });

export const SESSION_ENDED_MESSAGE = "Your session ended. Sign in again, then try once more.";

/** The owner may do everything. The team role does team work only in the departments listed for it, and a team actor with none listed works in no department. */
export function allows(actor: Actor | null, role: Role, department?: string): boolean {
  if (!actor) return false;
  if (actor.role === "owner") return true;
  if (role === "owner") return false;
  return !department || actor.departments.includes(department);
}
