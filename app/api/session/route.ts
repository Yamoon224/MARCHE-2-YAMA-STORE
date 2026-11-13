import { currentUser, endSession, startSession } from "@/lib/server/session";

export const POST = (request: Request) => startSession(request, "login");
export const GET = () => currentUser();
export const DELETE = () => endSession();
