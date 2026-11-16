import { startSession } from "@/lib/server/session";

/** Commande sans compte : ouvre une session invité (jeton dans le cookie httpOnly, comme une connexion). */
export const POST = (request: Request) => startSession(request, "guest");