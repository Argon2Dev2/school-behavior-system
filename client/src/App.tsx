import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Students from "./pages/Students";
import StudentProfile from "./pages/StudentProfile";
import Violations from "./pages/Violations";
import ViolationTypes from "./pages/ViolationTypes";
import ImprovementPlans from "./pages/ImprovementPlans";
import Reports from "./pages/Reports";
import AcademicYears from "./pages/AcademicYears";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import GradesAndSections from "./pages/GradesAndSections";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/students"} component={Students} />
      <Route path="/student/:id" component={StudentProfile} />
      <Route path="/violations" component={Violations} />
      <Route path="/violation-types" component={ViolationTypes} />
      <Route path={"/improvement-plans"} component={ImprovementPlans} />
      <Route path={"/reports"} component={Reports} />
      <Route path={"/academic-years"} component={AcademicYears} />
      <Route path={"/grades-sections"} component={GradesAndSections} />
      <Route path={"/notifications"} component={Notifications} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
