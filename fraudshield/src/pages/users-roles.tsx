import * as React from "react"
import {
  UserPlus,
  MoreHorizontal,
  Shield,
  ShieldCheck,
  BarChart3,
  Eye,
  UserCog,
  RotateCcw,
  Ban,
  Trash2,
  Mail,
  Check,
  Search,
  Users,
  Activity,
  Crown,
  Send,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { timeAgo } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Tabs } from "@/components/ui/tabs"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu } from "@/components/ui/dropdown-menu"
import { Tooltip } from "@/components/ui/tooltip"

type Role = "Admin" | "Analyst" | "Business Manager" | "Viewer"
type UserStatus = "Active" | "Invited" | "Disabled"

interface User {
  id: string
  name: string
  email: string
  role: Role
  status: UserStatus
  lastActive: string
  twoFactor: boolean
}

interface RoleDefinition {
  id: Role
  description: string
  users: number
  permissions: string
}

interface PendingInvite {
  id: string
  email: string
  role: Role
  invitedBy: string
  sentDate: string
}

const mockUsers: User[] = [
  { id: "u1", name: "Gule Sakeena", email: "gule@fraudshield.ai", role: "Admin", status: "Active", lastActive: "2026-09-08T14:32:15Z", twoFactor: true },
  { id: "u2", name: "Marcus Chen", email: "marcus@fraudshield.ai", role: "Analyst", status: "Active", lastActive: "2026-09-08T14:28:42Z", twoFactor: true },
  { id: "u3", name: "Sarah Williams", email: "sarah@fraudshield.ai", role: "Business Manager", status: "Active", lastActive: "2026-09-08T13:45:22Z", twoFactor: false },
  { id: "u4", name: "James Rodriguez", email: "james@fraudshield.ai", role: "Analyst", status: "Active", lastActive: "2026-09-08T13:30:15Z", twoFactor: true },
  { id: "u5", name: "Emily Park", email: "emily@fraudshield.ai", role: "Analyst", status: "Invited", lastActive: "", twoFactor: false },
  { id: "u6", name: "David Kim", email: "david@fraudshield.ai", role: "Viewer", status: "Active", lastActive: "2026-09-07T18:05:44Z", twoFactor: true },
]

const roleDefinitions: RoleDefinition[] = [
  {
    id: "Admin",
    description: "Full system access",
    users: 2,
    permissions: "Everything + User Management + System Settings + API Keys",
  },
  {
    id: "Analyst",
    description: "Investigation and detection access",
    users: 3,
    permissions: "Transactions, Alerts, Investigations, Customers, Fraud Network, AI Assistant, Reports",
  },
  {
    id: "Business Manager",
    description: "Reporting and analytics access",
    users: 1,
    permissions: "Dashboard, Transactions (read), Alerts (read), Customers (read), Reports, Analytics",
  },
  {
    id: "Viewer",
    description: "Read-only access",
    users: 1,
    permissions: "Dashboard (read), Transactions (read), Reports (read)",
  },
]

const mockPendingInvites: PendingInvite[] = [
  { id: "i1", email: "emily.park@fraudshield.ai", role: "Analyst", invitedBy: "Gule Sakeena", sentDate: "2026-09-06" },
  { id: "i2", email: "nina.patel@fraudshield.ai", role: "Viewer", invitedBy: "Marcus Chen", sentDate: "2026-09-05" },
  { id: "i3", email: "tom.baker@fraudshield.ai", role: "Business Manager", invitedBy: "Sarah Williams", sentDate: "2026-09-03" },
]

const roleOptions = [
  { label: "Admin", value: "Admin" },
  { label: "Analyst", value: "Analyst" },
  { label: "Business Manager", value: "Business Manager" },
  { label: "Viewer", value: "Viewer" },
]

const roleVariant: Record<Role, string> = {
  Admin: "border-purple-500/30 bg-purple-500/15 text-purple-400",
  Analyst: "border-blue-500/30 bg-blue-500/15 text-blue-400",
  "Business Manager": "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
  Viewer: "border-slate-500/30 bg-slate-500/15 text-slate-300",
}

const statusVariant: Record<UserStatus, string> = {
  Active: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
  Invited: "border-amber-500/30 bg-amber-500/15 text-amber-400",
  Disabled: "border-red-500/30 bg-red-500/15 text-red-400",
}

const roleIcon: Record<Role, React.ReactNode> = {
  Admin: <ShieldCheck className="h-4 w-4" />,
  Analyst: <Shield className="h-4 w-4" />,
  "Business Manager": <BarChart3 className="h-4 w-4" />,
  Viewer: <Eye className="h-4 w-4" />,
}

export default function UsersRolesPage() {
  const [activeTab, setActiveTab] = React.useState("users")
  const [users, setUsers] = React.useState<User[]>(mockUsers)
  const [invites, setInvites] = React.useState<PendingInvite[]>(mockPendingInvites)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState("all")
  const [inviteOpen, setInviteOpen] = React.useState(false)

  // Invite form
  const [inviteEmail, setInviteEmail] = React.useState("")
  const [inviteRole, setInviteRole] = React.useState("Analyst")
  const [inviteMessage, setInviteMessage] = React.useState("")
  const [inviteSubmitted, setInviteSubmitted] = React.useState(false)

  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.status === "Active").length
  const adminCount = users.filter((u) => u.role === "Admin").length
  const analystCount = users.filter((u) => u.role === "Analyst").length

  const filteredUsers = React.useMemo(() => {
    let result = [...users]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q)
      )
    }
    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter)
    }
    return result
  }, [users, searchQuery, roleFilter])

  const updateUser = (id: string, patch: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)))
    toast.success("User updated successfully")
  }

  const disableUser = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === "Disabled" ? "Active" : "Disabled" } : u
      )
    )
  }

  const removeUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
    toast.success("User removed")
  }

  const resendInvite = (_id: string) => {
    toast.success("Invitation resent")
  }

  const revokeInvite = (id: string) => {
    setInvites((prev) => prev.filter((i) => i.id !== id))
    toast.success("Invitation revoked")
  }

  const submitInvite = () => {
    setInviteSubmitted(true)
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      toast.error("Please enter a valid email address")
      return
    }
    const newInvite: PendingInvite = {
      id: `i${Date.now()}`,
      email: inviteEmail.trim(),
      role: inviteRole as Role,
      invitedBy: "Gule Sakeena",
      sentDate: new Date().toISOString().slice(0, 10),
    }
    setInvites((prev) => [newInvite, ...prev])
    setInviteOpen(false)
    setInviteEmail("")
    setInviteRole("Analyst")
    setInviteMessage("")
    setInviteSubmitted(false)
    toast.success(`Invitation sent to ${newInvite.email}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & Roles"
        description="Manage team access and permissions"
        actions={
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Invite User
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={totalUsers} color="text-primary" />
        <StatCard icon={Activity} label="Active" value={activeUsers} color="text-emerald-400" />
        <StatCard icon={Crown} label="Admins" value={adminCount} color="text-purple-400" />
        <StatCard icon={Shield} label="Analysts" value={analystCount} color="text-blue-400" />
      </div>

      <Tabs
        tabs={[
          { id: "users", label: "Users", count: users.length },
          { id: "roles", label: "Roles", count: roleDefinitions.length },
          { id: "invites", label: "Pending Invites", count: invites.length },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* ============ USERS TAB ============ */}
      {activeTab === "users" && (
        <div className="space-y-4 animate-fade-in">
          <Card className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="w-full sm:w-56">
                <Select
                  value={roleFilter}
                  onChange={setRoleFilter}
                  options={[
                    { label: "All Roles", value: "all" },
                    ...roleOptions,
                  ]}
                />
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20">
                    {["User", "Role", "Status", "Last Active", "2FA", ""].map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-border/30 transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn("text-[11px]", roleVariant[u.role])}>
                          <span className="mr-1">{roleIcon[u.role]}</span>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn("text-[11px]", statusVariant[u.status])}>
                          <span
                            className={cn(
                              "mr-1 h-1.5 w-1.5 rounded-full",
                              u.status === "Active"
                                ? "bg-emerald-400"
                                : u.status === "Invited"
                                ? "bg-amber-400"
                                : "bg-red-400"
                            )}
                          />
                          {u.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {u.lastActive ? timeAgo(new Date(u.lastActive)) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {u.status === "Active" ? (
                          u.twoFactor ? (
                            <Tooltip content="2FA enabled" side="top">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                                <Check className="h-3.5 w-3.5" />
                              </span>
                            </Tooltip>
                          ) : (
                            <Tooltip content="2FA not enabled" side="top">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
                                <X className="h-3.5 w-3.5" />
                              </span>
                            </Tooltip>
                          )
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu
                          align="right"
                          trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                          items={[
                            {
                              label: "Edit Role",
                              icon: <UserCog className="h-4 w-4" />,
                              onClick: () => updateUser(u.id, { role: u.role === "Viewer" ? "Analyst" : "Viewer" }),
                            },
                            {
                              label: "Manage 2FA",
                              icon: <Shield className="h-4 w-4" />,
                              onClick: () => updateUser(u.id, { twoFactor: !u.twoFactor }),
                            },
                            {
                              label: u.status === "Disabled" ? "Enable User" : "Disable",
                              icon: <Ban className="h-4 w-4" />,
                              danger: u.status !== "Disabled",
                              onClick: () => disableUser(u.id),
                            },
                            {
                              label: "Remove",
                              icon: <Trash2 className="h-4 w-4" />,
                              danger: true,
                              onClick: () => removeUser(u.id),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                        No users match your search
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-border/40 px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Showing {filteredUsers.length} of {users.length} users
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* ============ ROLES TAB ============ */}
      {activeTab === "roles" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 animate-fade-in">
          {roleDefinitions.map((role) => (
            <Card key={role.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        role.id === "Admin"
                          ? "bg-purple-500/15 text-purple-400"
                          : role.id === "Analyst"
                          ? "bg-blue-500/15 text-blue-400"
                          : role.id === "Business Manager"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-slate-500/15 text-slate-300"
                      )}
                    >
                      {roleIcon[role.id]}
                    </span>
                    <div>
                      <CardTitle>{role.id}</CardTitle>
                      <CardDescription className="mt-0.5">{role.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {role.users} {role.users === 1 ? "user" : "users"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <Separator className="mb-4" />
                <p className="text-sm font-medium text-foreground">Permissions</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {role.permissions}
                </p>
                <div className="mt-auto pt-4">
                  <div className="flex items-center gap-2">
                    {role.id === "Admin" && <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400">System Settings</Badge>}
                    <Button variant="outline" size="sm" className="text-xs">
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ============ PENDING INVITES TAB ============ */}
      {activeTab === "invites" && (
        <div className="space-y-4 animate-fade-in">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20">
                    {["Email", "Role", "Invited By", "Sent Date", ""].map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invites.map((invite) => (
                    <tr key={invite.id} className="border-b border-border/30 transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
                            <Mail className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-sm font-medium text-foreground">{invite.email}</p>
                            <p className="text-xs text-amber-400/80">Pending acceptance</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn("text-[11px]", roleVariant[invite.role])}>
                          <span className="mr-1">{roleIcon[invite.role]}</span>
                          {invite.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{invite.invitedBy}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{invite.sentDate}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => resendInvite(invite.id)}>
                            <RotateCcw className="h-3.5 w-3.5" />
                            Resend
                          </Button>
                          <Button variant="ghost" size="sm" className="text-xs text-red-400" onClick={() => revokeInvite(invite.id)}>
                            <Ban className="h-3.5 w-3.5" />
                            Revoke
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {invites.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                        No pending invitations
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ============ INVITE DIALOG ============ */}
      <Dialog
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite User"
        size="lg"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email address</label>
            <Input
              type="email"
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className={cn(
                inviteSubmitted && !inviteEmail.trim() && "border-red-500/60"
              )}
            />
            {inviteSubmitted && !inviteEmail.trim() && (
              <p className="text-xs text-red-400">Email address is required</p>
            )}
          </div>

          <div className="space-y-2">
            <Select
              label="Role"
              value={inviteRole}
              onChange={setInviteRole}
              options={roleOptions}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Message (optional)</label>
            <textarea
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              rows={3}
              placeholder="Add a personal message to the invitation..."
              className="flex w-full resize-none rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
            />
          </div>

          <div className="rounded-lg border border-border/50 bg-muted/20 p-3 text-xs text-muted-foreground">
            The invitee will receive an email with a secure link to set up their account.
            Invitations expire after 7 days.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitInvite}>
              <Send className="h-4 w-4" />
              Send Invite
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  color: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span className={cn("rounded-lg bg-muted/30 p-2", color)}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className={cn("mt-0.5 text-2xl font-bold tabular-nums text-foreground")}>{value}</p>
        </div>
      </div>
    </Card>
  )
}
