import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ChevronsUpDown,
  CirclePlus,
  Compass,
  FlaskConical,
  FolderOpen,
  LayoutDashboard,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Search,
  Settings2,
  User,
} from 'lucide-react'

import { useChatStore } from '../../store/chatStore'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function AppSidebar() {
  const {
    sessionHistory,
    sessionId,
    isPatientFormOpen,
    isSourcesPanelOpen,
    patientContext,
    newSession,
    loadSession,
    setSessionHistory,
    toggleSourcesPanel,
  } = useChatStore()

  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchSessions = async () => {
      try {
        const response = await fetch(`${API_BASE}/sessions`)
        if (!response.ok) {
          throw new Error('Failed to fetch sessions')
        }

        const sessions = await response.json()
        if (isMounted) {
          setSessionHistory(sessions)
        }
      } catch (error) {
        if (isMounted) {
          setSessionHistory([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchSessions()

    return () => {
      isMounted = false
    }
  }, [setSessionHistory])

  const filteredSessions = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return sessionHistory

    return sessionHistory.filter((session) => {
      return [session.patientName, session.disease]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search))
    })
  }, [query, sessionHistory])

  const handleLoadSession = async (targetSessionId) => {
    try {
      const response = await fetch(`${API_BASE}/sessions/${targetSessionId}`)
      if (!response.ok) {
        throw new Error('Failed to load session')
      }

      const session = await response.json()
      loadSession(session)
    } catch (error) {
      // Keep the current UI stable if session details fail.
    }
  }

  return (
    <Sidebar collapsible="icon">
        <SidebarHeader className="bg-sidebar/50 backdrop-blur-sm">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
                <a href="#">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#00C2B8] text-white shadow-lg shadow-[#00C2B8]/20">
                    <FlaskConical className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-bold tracking-widest uppercase text-[#00C2B8]">Curalink</span>
                    <span className="truncate text-[10px] font-medium uppercase tracking-[0.1em] text-sidebar-foreground/40">Clinical Research Hub</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          
          <div className="px-2 pt-0 pb-2">
            <SidebarInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter your research..."
              type="search"
              className="h-8 bg-sidebar-accent/50 border-none ring-offset-0 focus-visible:ring-1 text-xs"
            />
          </div>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent className="no-scrollbar">

          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/30">Active Context</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    tooltip="Clinical Condition"
                    className="data-[active=true]:bg-[#00C2B8]/10"
                    isActive={!!patientContext.disease}
                  >
                    <Activity className={cn("size-4", patientContext.disease ? "text-[#00C2B8]" : "opacity-40")} />
                    <span className={cn(patientContext.disease ? "font-medium" : "opacity-40 italic text-xs")}>
                      {patientContext.disease || 'No active study'}
                    </span>
                  </SidebarMenuButton>
                  {patientContext.location ? (
                    <SidebarMenuBadge className="bg-[#00C2B8]/20 text-[#00C2B8] border-[#00C2B8]/20">
                      {patientContext.location.slice(0, 2).toUpperCase()}
                    </SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/30">Recent Library</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuSkeleton showIcon />
                    </SidebarMenuItem>
                  ))
                ) : filteredSessions.length > 0 ? (
                  filteredSessions.map((session) => (
                    <SidebarMenuItem key={session.sessionId}>
                      <SidebarMenuButton
                        onClick={() => handleLoadSession(session.sessionId)}
                        isActive={session.sessionId === sessionId}
                        tooltip={session.disease}
                        className="py-1.5 h-auto group-data-[collapsible=icon]:p-2"
                      >
                        <FolderOpen className={cn("size-3.5", session.sessionId === sessionId ? "text-[#00C2B8]" : "opacity-40")} />
                        <div className="flex flex-col gap-0.5 overflow-hidden">
                          <span className={cn("truncate text-xs", session.sessionId === sessionId ? "font-semibold" : "opacity-70")}>
                            {session.patientName || 'Untitled session'}
                          </span>
                          <span className="truncate text-[10px] text-sidebar-foreground/30 font-medium">
                            {session.disease}
                          </span>
                        </div>
                      </SidebarMenuButton>
                      <SidebarMenuBadge className="text-[10px] opacity-40 tabular-nums">
                        {session.totalQueries || 0}
                      </SidebarMenuBadge>
                    </SidebarMenuItem>
                  ))
                ) : (
                  <SidebarMenuItem>
                    <SidebarMenuButton disabled className="opacity-40 italic text-xs">
                      <Search className="size-3.5" />
                      <span>No matching records</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>


        <SidebarRail />
      </Sidebar>
  )
}
