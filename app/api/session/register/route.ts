import { startSession } from "@/lib/server/session";

export const POST = (request: Request) => startSession(request, "register");
