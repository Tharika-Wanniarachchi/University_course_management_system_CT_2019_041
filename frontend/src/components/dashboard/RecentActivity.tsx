// src/components/dashboard/RecentActivity.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock } from "lucide-react";
import { fetchDashboard, type RecentItem } from "@/lib/dashboardApi";
import { Loader2 } from "lucide-react";

function formatWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export function RecentActivity() {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchDashboard();
        setItems(data.recent || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const badgeStyles: Record<RecentItem["type"], string> = {
    user: "bg-primary/10 text-primary",
    course: "bg-accent/10 text-accent",
    result: "bg-success/10 text-success",
    registration: "bg-warning/10 text-warning",
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="p-4 flex items-center gap-2 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No recent activity.</div>
        ) : (
          <div className="space-y-4">
            {items.map((a) => (
              <div key={`${a.type}-${a.id}`} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={`text-xs ${badgeStyles[a.type]}`}>
                      {a.type}
                    </Badge>
                    <span className="font-medium text-sm text-foreground">{a.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {a.subtitle && <span className="font-medium text-foreground">{a.subtitle}</span>}
                    {a.subtitle && a.meta && <span> • </span>}
                    {a.meta}
                  </p>
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="text-xs">{formatWhen(a.at)}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
