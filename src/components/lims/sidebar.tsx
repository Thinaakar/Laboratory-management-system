"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Beaker,
  Building2,
  Calendar,
  ClipboardCheck,
  ClipboardList,
  FileText,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  ScrollText,
  Settings,
  Shield,
  Stethoscope,
  TestTube2,
  Truck,
  UserCog,
  Users,
  Wallet,
  Wrench,
  Boxes,
  Layers,
} from "lucide-react";
import { LabCoreLogo } from "@/components/lims/labcore-logo";
import { LIMS_NAV } from "@/lib/navigation/modules";
import { getDefaultSettingsPath } from "@/lib/navigation/settings-nav";
import {
  clearSession,
  getSession,
  type SessionUser,
} from "@/lib/auth/demo-users";
import { logAuditAction } from "@/lib/audit/log-action";
import { usePermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ReactNode> = {
  Dashboard: <LayoutDashboard size={18} />,
  Patients: <Users size={18} />,
  Appointments: <Calendar size={18} />,
  Orders: <ClipboardList size={18} />,
  Billing: <Wallet size={18} />,
  Samples: <TestTube2 size={18} />,
  Results: <Beaker size={18} />,
  "Report Approval": <ClipboardCheck size={18} />,
  Reports: <FileText size={18} />,
  "Health Packages": <Package size={18} />,
  Operations: <Layers size={18} />,
  Inventory: <Boxes size={18} />,
  Suppliers: <Truck size={18} />,
  Equipment: <Wrench size={18} />,
  Referrals: <Stethoscope size={18} />,
  Analytics: <BarChart3 size={18} />,
  "User Management": <UserCog size={18} />,
  "Users & Roles": <UserCog size={18} />,
  Users: <UserCog size={18} />,
  Roles: <Shield size={18} />,
  Permissions: <KeyRound size={18} />,
  Branches: <Building2 size={18} />,
  "Audit Logs": <ScrollText size={18} />,
  Settings: <Settings size={18} />,
};

function isNavActive(
  pathname: string,
  href: string,
  activePaths?: string[],
): boolean {
  if (activePaths?.length) {
    return activePaths.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    );
  }
  if (pathname === href) return true;
  if (href === "/reports") {
    return (
      pathname.startsWith("/reports") &&
      !pathname.startsWith("/reports/approval")
    );
  }
  return pathname.startsWith(`${href}/`);
}

const SIDEBAR_STORAGE_KEY = "labcore-sidebar-collapsed";

function UserAvatar({ name, title }: { name: string; title?: string }) {
  const letter = (name?.[0] ?? "U").toUpperCase();
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary"
      aria-hidden
      title={title}
    >
      {letter}
    </div>
  );
}

export function LimsSidebar() {
  const pathname = usePathname();
  const { can } = usePermissions();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setSession(getSession());
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
    } catch {
      /* ignore */
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  function handleSignOut() {
    if (session) {
      logAuditAction({
        action: "LOGOUT",
        module: "auth",
        details: "User signed out",
        userId: session.email,
        userName: session.name,
      });
    }
    clearSession();
    window.location.href = "/login";
  }

  const displayName = session?.name ?? "User";

  return (
    <aside
      className={cn(
        "lims-sidebar flex h-full shrink-0 flex-col border-r border-white/[0.06]",
        collapsed && "lims-sidebar--collapsed",
      )}
    >
      <div
        className={cn(
          "relative flex shrink-0 items-center border-b border-white/[0.06] py-3.5",
          collapsed ? "justify-center px-2" : "gap-2 px-3",
        )}
      >
        {!collapsed && (
          <Link
            href="/dashboard"
            className="relative z-0 inline-flex min-w-0 flex-1 overflow-hidden"
          >
            <LabCoreLogo size="md" priority />
          </Link>
        )}
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleCollapsed();
          }}
          className={cn(
            "lims-sidebar-toggle h-9 w-9",
            !collapsed && "ml-auto",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav
        className={cn(
          "flex-1 space-y-3 overflow-y-auto no-scrollbar py-2.5",
          collapsed ? "px-1.5" : "px-2",
        )}
      >
        {LIMS_NAV.map((group) => {
          const items = group.items.filter((item) => {
            if (item.permissions?.length) {
              return item.permissions.some((p) => can(p));
            }
            return !item.permission || can(item.permission);
          });
          if (!items.length) return null;
          const showGroupTitle =
            !collapsed &&
            !(items.length === 1 && items[0].label === group.title);
          return (
            <div key={group.title}>
              {showGroupTitle && (
                <p className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {group.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const href =
                    item.label === "Settings"
                      ? getDefaultSettingsPath(can)
                      : item.href;
                  const active = isNavActive(
                    pathname,
                    item.href,
                    item.activePaths,
                  );
                  return (
                    <li key={`${group.title}-${item.href}`}>
                      <Link
                        href={href}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "lims-nav-link",
                          active && "lims-nav-link-active",
                          collapsed && "justify-center px-2",
                        )}
                      >
                        {ICONS[item.label] ?? <Activity size={18} />}
                        {!collapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div
        className={cn(
          "border-t border-white/[0.06] p-2.5",
          collapsed && "flex flex-col items-center gap-2",
        )}
      >
        {collapsed ? (
          <>
            <UserAvatar name={displayName} title={displayName} />
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out"
              className="lims-nav-link justify-center px-2 text-red-300 hover:text-red-200"
            >
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2.5 px-2">
              <UserAvatar name={displayName} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white">
                  {displayName}
                </p>
                <p className="truncate text-[10px] text-slate-400">
                  {session?.role ?? ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="lims-nav-link mt-2 w-full text-left text-red-300 hover:text-red-200"
            >
              <LogOut size={16} /> Sign out
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
