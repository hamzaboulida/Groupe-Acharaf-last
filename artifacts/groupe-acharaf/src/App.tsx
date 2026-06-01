import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import NotFound from "@/pages/not-found";

// Page Imports
import Home from "@/pages/Home";
import APropos from "@/pages/APropos";
import NosMarques from "@/pages/NosMarques";
import NosProjets from "@/pages/NosProjets";
import ProjectDetail from "@/pages/ProjectDetail";
import Opportunites from "@/pages/Opportunites";
import ArticleDetail from "@/pages/ArticleDetail";
import Carrieres from "@/pages/Carrieres";
import Contact from "@/pages/Contact";
import Admin from "@/pages/Admin";
import AdminLogin from "@/pages/AdminLogin";

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

function RedirectToOpportunites() {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate("/opportunites", { replace: true });
  }, [navigate]);
  return null;
}

function RedirectToNosProjets() {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate("/nos-projets", { replace: true });
  }, [navigate]);
  return null;
}

function RedirectProjetDetailToNosProjets() {
  const [location, navigate] = useLocation();
  useEffect(() => {
    const suffix = location.replace(/^\/projets\/?/, "");
    navigate(suffix ? `/nos-projets/${suffix}` : "/nos-projets", { replace: true });
  }, [location, navigate]);
  return null;
}

function RequireAdminAuth() {
  const [, navigate] = useLocation();
  const [state, setState] = useState<"checking" | "ok" | "denied">("checking");

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const response = await fetch("/api/admin/session", {
          credentials: "same-origin",
        });
        if (cancelled) return;
        if (response.ok) {
          setState("ok");
          return;
        }
        setState("denied");
        navigate("/admin/login", { replace: true });
      } catch {
        if (cancelled) return;
        setState("denied");
        navigate("/admin/login", { replace: true });
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (state !== "ok") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[#8EA4AF] text-xs tracking-[0.2em] uppercase animate-pulse">Vérification…</div>
      </div>
    );
  }
  return <Admin />;
}

function RedirectAdminIfAuthenticated() {
  const [, navigate] = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const response = await fetch("/api/admin/session", { credentials: "same-origin" });
        if (cancelled) return;
        if (response.ok) {
          navigate("/admin", { replace: true });
          return;
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[#8EA4AF] text-xs tracking-[0.2em] uppercase animate-pulse">Chargement…</div>
      </div>
    );
  }

  return <AdminLogin />;
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
          <Route path="/projets" component={RedirectToNosProjets} />
          <Route path="/projets/:id" component={RedirectProjetDetailToNosProjets} />
          <Route path="/nos-projets/:id" component={ProjectDetail} />
          <Route path="/opportunites" component={Opportunites} />
          <Route path="/actualites" component={RedirectToOpportunites} />
          <Route path="/actualites/:id" component={ArticleDetail} />
          <Route path="/carrieres" component={Carrieres} />
          <Route path="/contact" component={Contact} />
          <Route path="/admin/login" component={RedirectAdminIfAuthenticated} />
          <Route path="/admin" component={RequireAdminAuth} />
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
