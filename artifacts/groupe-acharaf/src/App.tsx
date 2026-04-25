import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";

// Page Imports
import Home from "@/pages/Home";
import APropos from "@/pages/APropos";
import NosMarques from "@/pages/NosMarques";
import NosProjets from "@/pages/NosProjets";
import ProjectDetail from "@/pages/ProjectDetail";
import Actualites from "@/pages/Actualites";
import ArticleDetail from "@/pages/ArticleDetail";
import Carrieres from "@/pages/Carrieres";
import Contact from "@/pages/Contact";
import Admin from "@/pages/Admin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/a-propos" component={APropos} />
          <Route path="/nos-marques" component={NosMarques} />
          <Route path="/nos-projets" component={NosProjets} />
          <Route path="/nos-projets/:id" component={ProjectDetail} />
          <Route path="/actualites" component={Actualites} />
          <Route path="/actualites/:id" component={ArticleDetail} />
          <Route path="/carrieres" component={Carrieres} />
          <Route path="/contact" component={Contact} />
          <Route path="/admin" component={Admin} />
          <Route component={NotFound} />
        </Switch>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;