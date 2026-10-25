/**
 * The connection to Lovable Cloud (Supabase) that the family's apps share: a fetch that
 * carries the app's key, and the sign-in for invited users with a magic link.
 *
 * Written with `fetch` straight against Supabase's REST interface instead of their
 * library: sign-in takes four calls and sharing a handful more, and the library would be
 * weight without use for everyone who never signs in, which is nearly everyone.
 *
 * Sign-in is for invited users only: `create_user: false` means an unknown address gets
 * a no and not a new account, and self-registration is switched off in Lovable Cloud.
 * The app creates one client with its address and key (`createCloud`); without them (no
 * Lovable Cloud in the build) the client says so and the app works as before.
 */
export class CloudError extends Error {
    constructor(status, code, message) {
        super(message);
        this.status = status;
        this.code = code;
        this.name = "CloudError";
    }
}
/** Renew a while before it runs out, not in the same second. */
const REFRESH_MARGIN_S = 60;
async function errorFrom(response) {
    let code = "";
    let message = response.statusText;
    try {
        const body = (await response.json());
        code = String(body["error_code"] ?? body["code"] ?? body["error"] ?? "");
        message = String(body["msg"] ?? body["message"] ?? body["error_description"] ?? message);
    }
    catch {
        // No JSON in the answer: the status has to do.
    }
    return new CloudError(response.status, code, message);
}
/** The claims of a JWT, without checking it: the server does that. */
function jwtClaims(token) {
    try {
        const part = token.split(".")[1] ?? "";
        const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(Array.from(atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4)), (c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`).join(""));
        return JSON.parse(json);
    }
    catch {
        return {};
    }
}
export function sessionFromTokens(tokens) {
    const claims = jwtClaims(tokens.access_token);
    const userId = typeof claims["sub"] === "string" ? claims["sub"] : null;
    if (!userId || !tokens.refresh_token)
        return null;
    const expiresAt = Number(tokens.expires_at) ||
        Math.floor(Date.now() / 1000) + (Number(tokens.expires_in) || 3600);
    return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        userId,
        email: typeof claims["email"] === "string" ? claims["email"] : "",
    };
}
/** Whether an address fragment carries a sign-in (`#access_token=…`) or its failure. */
export function hashCarriesSignIn(hash) {
    return /(^#|&)(access_token|error_code)=/.test(hash);
}
/**
 * The client for one app. `config` is null when the build has no Lovable Cloud: then
 * `configured` is false, every call throws `CloudError("not-configured")`, and the
 * session functions answer as signed out.
 */
export function createCloud(config) {
    const cfg = config ? { ...config, url: config.url.replace(/\/+$/, "") } : null;
    const listeners = new Set();
    let refreshing = null;
    function requireConfig() {
        if (!cfg)
            throw new CloudError(0, "not-configured", "Lovable Cloud is not configured");
        return cfg;
    }
    function storage() {
        try {
            return typeof window === "undefined" ? null : window.localStorage;
        }
        catch {
            return null;
        }
    }
    function writeSession(session) {
        try {
            if (!cfg)
                return;
            if (session)
                storage()?.setItem(cfg.sessionStorageKey, JSON.stringify(session));
            else
                storage()?.removeItem(cfg.sessionStorageKey);
        }
        catch {
            // Full or blocked storage: one signs in again next time.
        }
        for (const listener of listeners)
            listener();
    }
    /**
     * A call to Supabase. With `token` as signed in, otherwise as anonymous, the way readers
     * of a shared link call; the database's rules decide what they reach.
     */
    async function cloudFetch(path, init = {}) {
        const { url, key } = requireConfig();
        const { token, ...rest } = init;
        const headers = new Headers(rest.headers);
        headers.set("apikey", key);
        headers.set("Authorization", `Bearer ${token ?? key}`);
        let response;
        try {
            response = await fetch(`${url}${path}`, { ...rest, headers });
        }
        catch {
            throw new CloudError(0, "offline", "network error");
        }
        if (!response.ok)
            throw await errorFrom(response);
        return response;
    }
    /**
     * The stored sign-in, without asking any server: what the interface goes by to decide
     * whether sharing is shown. Whoever never signed in costs no call at all.
     */
    function storedSession() {
        if (!cfg)
            return null;
        try {
            const raw = storage()?.getItem(cfg.sessionStorageKey);
            if (!raw)
                return null;
            const s = JSON.parse(raw);
            return typeof s.accessToken === "string" &&
                typeof s.refreshToken === "string" &&
                typeof s.expiresAt === "number" &&
                typeof s.userId === "string"
                ? s
                : null;
        }
        catch {
            return null;
        }
    }
    /** Tells when one signed in or out, in another tab too. */
    function onSessionChange(listener) {
        listeners.add(listener);
        const onStorage = (e) => {
            if (cfg && e.key === cfg.sessionStorageKey)
                listener();
        };
        if (typeof window !== "undefined")
            window.addEventListener("storage", onStorage);
        return () => {
            listeners.delete(listener);
            if (typeof window !== "undefined")
                window.removeEventListener("storage", onStorage);
        };
    }
    /** Sends a sign-in link, to addresses that already have an account only. */
    async function sendSignInLink(email, redirectTo) {
        try {
            await cloudFetch(`/auth/v1/otp?redirect_to=${encodeURIComponent(redirectTo)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), create_user: false }),
            });
            return "sent";
        }
        catch (e) {
            if (!(e instanceof CloudError))
                return "failed";
            if (e.status === 429)
                return "too-many";
            // Supabase says "otp_disabled" / "Signups not allowed for otp" when the address
            // has no account and none may be created.
            if (e.status === 422 ||
                e.status === 400 ||
                /signup|otp_disabled/i.test(e.code + e.message)) {
                return "no-invite";
            }
            return "failed";
        }
    }
    /**
     * Takes what the address carries when one comes back from the sign-in link or the
     * invitation: `#access_token=…&refresh_token=…`, or `#error=…` when the link has run
     * out. Says what happened, or null when the address carried no sign-in.
     */
    function completeSignInFromHash(hash) {
        const params = new URLSearchParams(hash.replace(/^#/, ""));
        if (params.get("error") || params.get("error_code"))
            return "link-expired";
        const access = params.get("access_token");
        const refresh = params.get("refresh_token");
        if (!access || !refresh)
            return null;
        const session = sessionFromTokens({
            access_token: access,
            refresh_token: refresh,
            expires_at: params.get("expires_at") ?? undefined,
            expires_in: params.get("expires_in") ?? undefined,
        });
        if (!session)
            return "link-expired";
        writeSession(session);
        return "signed-in";
    }
    /** A valid sign-in to call with: the stored one, renewed when about to run out. */
    async function activeSession() {
        const session = storedSession();
        if (!session)
            return null;
        if (session.expiresAt - REFRESH_MARGIN_S > Date.now() / 1000)
            return session;
        refreshing ?? (refreshing = (async () => {
            try {
                const response = await cloudFetch("/auth/v1/token?grant_type=refresh_token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refresh_token: session.refreshToken }),
                });
                const next = sessionFromTokens((await response.json()));
                writeSession(next);
                return next;
            }
            catch (e) {
                // Offline, the sign-in is kept for the next try. If the server says no, it is
                // over and must not stay.
                if (e instanceof CloudError && e.status >= 400 && e.status < 500)
                    writeSession(null);
                return null;
            }
            finally {
                refreshing = null;
            }
        })());
        return refreshing;
    }
    async function signOut() {
        const session = storedSession();
        writeSession(null);
        if (!session)
            return;
        try {
            await cloudFetch("/auth/v1/logout", { method: "POST", token: session.accessToken });
        }
        catch {
            // The sign-in is already gone here; the server forgets it when it runs out.
        }
    }
    return {
        configured: cfg !== null,
        cloudFetch,
        storedSession,
        onSessionChange,
        sendSignInLink,
        completeSignInFromHash,
        activeSession,
        signOut,
    };
}
