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
export type CloudConfig = {
    /** The project's address, e.g. https://xyz.supabase.co. */
    url: string;
    /** The publishable (anon) key. */
    key: string;
    /** Where the sign-in is kept in localStorage, e.g. "controlfreak-review.account.v1". */
    sessionStorageKey: string;
};
export declare class CloudError extends Error {
    readonly status: number;
    readonly code: string;
    constructor(status: number, code: string, message: string);
}
export type CloudSession = {
    accessToken: string;
    refreshToken: string;
    /** Seconds since 1970, as Supabase gives it. */
    expiresAt: number;
    userId: string;
    email: string;
};
export type SignInResult = "sent" | "no-invite" | "too-many" | "failed";
export declare function sessionFromTokens(tokens: {
    access_token: string;
    refresh_token: string;
    expires_at?: number | string | undefined;
    expires_in?: number | string | undefined;
}): CloudSession | null;
/** Whether an address fragment carries a sign-in (`#access_token=…`) or its failure. */
export declare function hashCarriesSignIn(hash: string): boolean;
export type Cloud = ReturnType<typeof createCloud>;
/**
 * The client for one app. `config` is null when the build has no Lovable Cloud: then
 * `configured` is false, every call throws `CloudError("not-configured")`, and the
 * session functions answer as signed out.
 */
export declare function createCloud(config: CloudConfig | null): {
    configured: boolean;
    cloudFetch: (path: string, init?: RequestInit & {
        token?: string | null;
    }) => Promise<Response>;
    storedSession: () => CloudSession | null;
    onSessionChange: (listener: () => void) => () => void;
    sendSignInLink: (email: string, redirectTo: string) => Promise<SignInResult>;
    completeSignInFromHash: (hash: string) => "signed-in" | "link-expired" | null;
    activeSession: () => Promise<CloudSession | null>;
    signOut: () => Promise<void>;
};
