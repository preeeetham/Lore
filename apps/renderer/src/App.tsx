import { useState, useEffect } from "react";
import {
  ArrowUp,
  FolderOpen,
  MessageSquare,
  PanelLeftIcon,
  Settings,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

type Section = "workspace" | "chat" | "settings";

function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="grid grid-cols-3 gap-3">
      <button
        onClick={() => setTheme("light")}
        className={cn(
          "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
          theme === "light"
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        <Sun
          className={cn(
            "size-6",
            theme === "light" ? "text-primary" : "text-muted-foreground"
          )}
        />
        <span
          className={cn(
            "text-sm font-medium",
            theme === "light" ? "text-primary" : "text-foreground"
          )}
        >
          Light
        </span>
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={cn(
          "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
          theme === "dark"
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        <Moon
          className={cn(
            "size-6",
            theme === "dark" ? "text-primary" : "text-muted-foreground"
          )}
        />
        <span
          className={cn(
            "text-sm font-medium",
            theme === "dark" ? "text-primary" : "text-foreground"
          )}
        >
          Dark
        </span>
      </button>
      <button
        onClick={() => setTheme("system")}
        className={cn(
          "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
          theme === "system"
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        <Monitor
          className={cn(
            "size-6",
            theme === "system" ? "text-primary" : "text-muted-foreground"
          )}
        />
        <span
          className={cn(
            "text-sm font-medium",
            theme === "system" ? "text-primary" : "text-foreground"
          )}
        >
          System
        </span>
      </button>
    </div>
  );
}

function SidebarContentPanel({
  activeSection,
  onSectionChange,
  entries,
}: {
  activeSection: Section;
  onSectionChange: (s: Section) => void;
  entries: { name: string; path: string; kind: string }[];
}) {
  const { open } = useSidebar();

  if (!open) return null;

  return (
    <Sidebar>
      <SidebarHeader>
        <span className="text-sm font-medium px-2">Lore</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeSection === "workspace"}
                  onClick={() => onSectionChange("workspace")}
                >
                  <FolderOpen className="size-4" />
                  <span>Knowledge</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            {activeSection === "workspace" && entries.length > 0 && (
              <ul className="mt-2 space-y-1 px-2 text-xs text-muted-foreground">
                {entries.slice(0, 8).map((e) => (
                  <li key={e.path} className="truncate">
                    {e.name}
                  </li>
                ))}
              </ul>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Chat</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeSection === "chat"}
                  onClick={() => onSectionChange("chat")}
                >
                  <MessageSquare className="size-4" />
                  <span>New Chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeSection === "settings"}
                  onClick={() => onSectionChange("settings")}
                >
                  <Settings className="size-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function AppContent() {
  const [activeSection, setActiveSection] = useState<Section>("chat");
  const [workspaceRoot, setWorkspaceRoot] = useState<string>("");
  const [entries, setEntries] = useState<
    { name: string; path: string; kind: string }[]
  >([]);
  const [message, setMessage] = useState("");
  const { open, toggleSidebar } = useSidebar();

  useEffect(() => {
    if (typeof window !== "undefined" && window.ipc) {
      window.ipc.invoke("workspace:getRoot", null).then((res: unknown) => {
        const r = res as { root: string };
        setWorkspaceRoot(r.root);
      });
    }
  }, []);

  useEffect(() => {
    if (workspaceRoot && typeof window !== "undefined" && window.ipc) {
      window.ipc
        .invoke("workspace:readdir", { path: "", opts: {} })
        .then((res: unknown) => {
          const e = res as { name: string; path: string; kind: string }[];
          setEntries(e);
        });
    }
  }, [workspaceRoot]);

  const headerTitle =
    activeSection === "workspace"
      ? "Workspace"
      : activeSection === "chat"
        ? "Chat"
        : "Settings";

  return (
    <>
      <SidebarContentPanel
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          entries={entries}
        />

        <SidebarInset className="overflow-hidden! min-h-0">
          <header className="titlebar-drag-region flex h-10 shrink-0 items-center gap-2 border-b border-border px-3 bg-sidebar">
            <Button
              variant="ghost"
              size="icon"
              className="titlebar-no-drag size-8"
              onClick={toggleSidebar}
            >
              <PanelLeftIcon className="size-4" />
            </Button>
            <span className="text-sm font-medium text-muted-foreground flex-1 min-w-0 truncate">
              {headerTitle}
            </span>
          </header>

          {activeSection === "workspace" ? (
            <div className="flex-1 min-h-0 overflow-auto p-6">
              <h2 className="mb-4 text-xl font-semibold">Workspace</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Root: {workspaceRoot || "Loading…"}
              </p>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="mb-2 text-sm font-medium">Contents</p>
                <ul className="space-y-1 text-sm">
                  {entries.map((e) => (
                    <li key={e.path} className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-xs",
                          e.kind === "dir"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {e.kind}
                      </span>
                      {e.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : activeSection === "settings" ? (
            <div className="flex-1 min-h-0 overflow-auto p-6">
              <h2 className="mb-4 text-xl font-semibold">Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-sm font-medium">Appearance</h3>
                  <ThemeSelector />
                </div>
                <p className="text-sm text-muted-foreground">
                  Model configuration (OpenRouter, Ollama, etc.) will appear
                  here.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="relative flex-1 overflow-y-auto">
                <div className="mx-auto w-full max-w-4xl pb-28 pt-6">
                  <div className="flex size-full flex-col items-center justify-center gap-3 p-8 text-center">
                    <p className="text-muted-foreground">
                      How can I help you today?
                    </p>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 z-10 bg-background pb-12 pt-0 shadow-lg">
                <div className="mx-auto w-full max-w-4xl px-4">
                  <div className="flex items-center gap-2 bg-background border border-border rounded-lg shadow-none px-4 py-4">
                    <input
                      placeholder="Type your message..."
                      className="min-h-6 py-0 border-0 shadow-none focus-visible:ring-0 rounded-none flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button
                      size="icon"
                      className="h-7 w-7 rounded-full shrink-0 transition-all bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SidebarInset>

        {!open && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="flex items-center gap-2 bg-background border border-border rounded-lg shadow-none px-4 py-2.5 w-80">
              <input
                type="text"
                placeholder="Ask anything..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <Button
                size="icon"
                className="h-7 w-7 rounded-full shrink-0 transition-all bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
    </>
  );
}

function App() {
  return (
    <div className="flex h-svh w-full">
      <SidebarProvider style={{ "--sidebar-width": "256px" } as React.CSSProperties}>
        <AppContent />
      </SidebarProvider>
    </div>
  );
}

export default App;
