import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { fetchAction } from "convex/nextjs";

// Mirror the cookie names used by @convex-dev/auth/nextjs/server
function cookieNames(prefix: string) {
  return {
    token: `${prefix}__convexAuthJWT`,
    refreshToken: `${prefix}__convexAuthRefreshToken`,
    verifier: `${prefix}__convexAuthOAuthVerifier`,
  };
}

function cookieOpts(secure: boolean) {
  return { httpOnly: true, sameSite: "lax" as const, path: "/", secure };
}

function clearCookieOpts(secure: boolean) {
  return { ...cookieOpts(secure), maxAge: 0 };
}

export async function POST(request: Request) {
  const headerStore = await headers();
  const host = headerStore.get("host") ?? "";
  const isLocalhost = host === "localhost" || host.startsWith("localhost:");
  const prefix = isLocalhost ? "" : "__Host-";
  const names = cookieNames(prefix);
  const secure = !isLocalhost;

  const cookieStore = await cookies();
  const { action, args } = await request.json();

  if (action !== "auth:signIn" && action !== "auth:signOut") {
    return new Response("Invalid action", { status: 400 });
  }

  if (action === "auth:signOut") {
    const token = cookieStore.get(names.token)?.value;
    try {
      await fetchAction("auth:signOut" as never, args as never, { token });
    } catch {
      // ignore — user may already be signed out
    }
    const res = NextResponse.json(null);
    res.cookies.set(names.token, "", clearCookieOpts(secure));
    res.cookies.set(names.refreshToken, "", clearCookieOpts(secure));
    return res;
  }

  // auth:signIn
  // The client sends a dummy refreshToken; swap in the real one from the cookie.
  if ((args as Record<string, unknown>).refreshToken !== undefined) {
    const serverRefreshToken = cookieStore.get(names.refreshToken)?.value ?? null;
    if (serverRefreshToken === null) {
      return NextResponse.json({ tokens: null });
    }
    (args as Record<string, unknown>).refreshToken = serverRefreshToken;
  }

  const currentToken = cookieStore.get(names.token)?.value;
  const isCodeOrRefresh =
    (args as Record<string, unknown>).refreshToken !== undefined ||
    (args as Record<string, Record<string, unknown>>).params?.code !== undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any;
  try {
    result = await fetchAction(
      "auth:signIn" as never,
      args as never,
      isCodeOrRefresh ? {} : { token: currentToken },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Auth error";
    const res = NextResponse.json({ error: message }, { status: 400 });
    res.cookies.set(names.token, "", clearCookieOpts(secure));
    res.cookies.set(names.refreshToken, "", clearCookieOpts(secure));
    return res;
  }

  if (result.redirect !== undefined) {
    // Return verifier so the client can store it in localStorage for the code exchange.
    // Without this the client stores undefined and Convex rejects the code exchange.
    const res = NextResponse.json({ redirect: result.redirect, verifier: result.verifier });
    res.cookies.set(names.verifier, result.verifier ?? "", cookieOpts(secure));
    return res;
  }

  if (result.tokens !== undefined) {
    const res = NextResponse.json({
      tokens:
        result.tokens !== null
          ? { token: result.tokens.token, refreshToken: "dummy" }
          : null,
    });
    if (result.tokens !== null) {
      res.cookies.set(names.token, result.tokens.token, cookieOpts(secure));
      res.cookies.set(names.refreshToken, result.tokens.refreshToken, cookieOpts(secure));
    } else {
      res.cookies.set(names.token, "", clearCookieOpts(secure));
      res.cookies.set(names.refreshToken, "", clearCookieOpts(secure));
    }
    return res;
  }

  return NextResponse.json(result);
}
