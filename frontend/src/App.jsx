import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppShell from './components/layout/AppShell';

function App() {
  return (
    <SidebarProvider>
      <TooltipProvider>
        <AppShell />
      </TooltipProvider>
    </SidebarProvider>
  );
}

export default App;

