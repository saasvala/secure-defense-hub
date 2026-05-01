import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Shield, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background grid-bg p-4">
      <div className="text-center max-w-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded border border-destructive/30 bg-card mb-4">
          <Shield className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="mb-2 text-3xl font-tactical text-destructive">404</h1>
        <p className="mb-1 text-sm font-tactical text-foreground">SECTOR NOT FOUND</p>
        <p className="mb-6 text-xs text-muted-foreground font-tactical break-all">
          {location.pathname}
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-tactical rounded hover:bg-primary/90"
        >
          <ArrowLeft className="w-3 h-3" /> Return to Command Center
        </button>
      </div>
    </div>
  );
};

export default NotFound;
