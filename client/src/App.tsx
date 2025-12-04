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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
