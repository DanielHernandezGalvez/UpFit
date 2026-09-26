import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const PUBLIC_PATHS = new Set([
  "/auth/login",
  "/auth/sign-up",
  "/auth/forgot-password",
  "/auth/callback",
])

const AUTH_ENTRY_PATHS = new Set([
  "/auth/login",
  "/auth/sign-up",
  "/auth/forgot-password",
])

export async function updateSession(request: NextRequest) {
  if (request.nextUrl.pathname === "/auth/callback") {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return supabaseResponse
  }

  const pendingCookies: {
    name: string
    value: string
    options?: Parameters<typeof supabaseResponse.cookies.set>[2]
  }[] = []

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        pendingCookies.splice(0, pendingCookies.length, ...cookiesToSet)
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options)
        })
      },
    },
  })

  // getSession lee la cookie. getUser iría a la red en cada navegación.
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user ?? null

  const { pathname } = request.nextUrl
  let redirectPath: string | null = null

  if (!user && pathname === "/auth/update-password") {
    redirectPath = "/auth/forgot-password"
  } else if (!user && !PUBLIC_PATHS.has(pathname)) {
    redirectPath = "/auth/login"
  } else if (user && AUTH_ENTRY_PATHS.has(pathname)) {
    redirectPath = "/"
  }

  if (!redirectPath) {
    return supabaseResponse
  }

  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname = redirectPath
  redirectUrl.search = ""
  const redirectResponse = NextResponse.redirect(redirectUrl)
  pendingCookies.forEach(({ name, value, options }) => {
    redirectResponse.cookies.set(name, value, options)
  })
  return redirectResponse
}
