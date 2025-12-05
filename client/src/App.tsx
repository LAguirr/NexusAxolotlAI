import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/home";
import MissionDon from "@/pages/mission-don";
import MissionBenevolat from "@/pages/mission-benevolat";
import MissionContact from "@/pages/mission-contact";
import MissionInformations from "@/pages/mission-informations";
import Confirmation from "@/pages/confirmation";
import NotFound from "@/pages/not-found";
import { ChatProvider } from "@/lib/chat-context";
import { AIChatWidget } from "@/components/ai-chat-widget";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/mission/don" component={MissionDon} />
      <Route path="/mission/benevolat" component={MissionBenevolat} />
      <Route path="/mission/contact" component={MissionContact} />
      <Route path="/mission/informations" component={MissionInformations} />
      <Route path="/confirmation/:id" component={Confirmation} />
      <Route component={NotFound} />
    </Switch>
  );
}

import { Footer } from "@/components/footer";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ChatProvider>
          <Toaster />
          <div className="flex flex-col min-h-screen">
            <Router />
            <Footer />
          </div>
          <AIChatWidget />
        </ChatProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
