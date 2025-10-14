import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Filter, LogOut, Plus } from "lucide-react";
import { NewEntryDialog } from "@/components/NewEntryDialog";
import { format } from "date-fns";

type JournalEntry = {
  id: string;
  content: string;
  category: string;
  media_type: string;
  media_url: string | null;
  media_annotation: string | null;
  vibe: string | null;
  created_at: string;
};

export default function Archive() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [mediaFilter, setMediaFilter] = useState<string>("all");
  const [vibeFilter, setVibeFilter] = useState<string>("all");
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchEntries();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [entries, categoryFilter, mediaFilter, vibeFilter]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your journal entries.",
      });
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  const filterEntries = () => {
    let filtered = [...entries];

    if (categoryFilter !== "all") {
      filtered = filtered.filter((entry) => entry.category === categoryFilter);
    }

    if (mediaFilter !== "all") {
      filtered = filtered.filter((entry) => entry.media_type === mediaFilter);
    }

    if (vibeFilter !== "all") {
      filtered = filtered.filter((entry) => entry.vibe === vibeFilter);
    }

    setFilteredEntries(filtered);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      thoughts: "bg-primary/20 text-primary",
      wishes: "bg-accent/20 text-accent-foreground",
      grievances: "bg-destructive/20 text-destructive",
      reflection: "bg-secondary/40 text-secondary-foreground",
      gratitude: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  const getVibeEmoji = (vibe: string | null) => {
    const emojis: Record<string, string> = {
      happy: "😊",
      sad: "😢",
      anxious: "😰",
      calm: "😌",
      excited: "🤩",
      angry: "😠",
      peaceful: "🕊️",
      confused: "😕",
      hopeful: "🌟",
      neutral: "😐",
    };
    return vibe ? emojis[vibe] || "" : "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Your Journal Archive</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters and New Entry */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter by:</span>
            </div>
            <Button onClick={() => setIsNewEntryOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="thoughts">Thoughts</SelectItem>
                <SelectItem value="wishes">Wishes</SelectItem>
                <SelectItem value="grievances">Grievances</SelectItem>
                <SelectItem value="reflection">Reflection</SelectItem>
                <SelectItem value="gratitude">Gratitude</SelectItem>
              </SelectContent>
            </Select>

            <Select value={mediaFilter} onValueChange={setMediaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Media Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Media Types</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="voice">Voice</SelectItem>
                <SelectItem value="annotated_media_link">Media Link</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>

            <Select value={vibeFilter} onValueChange={setVibeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Vibe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vibes</SelectItem>
                <SelectItem value="happy">Happy 😊</SelectItem>
                <SelectItem value="sad">Sad 😢</SelectItem>
                <SelectItem value="anxious">Anxious 😰</SelectItem>
                <SelectItem value="calm">Calm 😌</SelectItem>
                <SelectItem value="excited">Excited 🤩</SelectItem>
                <SelectItem value="angry">Angry 😠</SelectItem>
                <SelectItem value="peaceful">Peaceful 🕊️</SelectItem>
                <SelectItem value="confused">Confused 😕</SelectItem>
                <SelectItem value="hopeful">Hopeful 🌟</SelectItem>
                <SelectItem value="neutral">Neutral 😐</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Entries Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading your entries...</div>
        ) : filteredEntries.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {entries.length === 0
                  ? "No entries yet. Start your journaling journey!"
                  : "No entries match your filters."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((entry) => (
              <Card
                key={entry.id}
                className="hover:shadow-[var(--shadow-soft)] transition-all duration-300 hover:scale-[1.02]"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <Badge className={getCategoryColor(entry.category)}>
                      {entry.category}
                    </Badge>
                    {entry.vibe && (
                      <span className="text-2xl" title={entry.vibe}>
                        {getVibeEmoji(entry.vibe)}
                      </span>
                    )}
                  </div>
                  <CardDescription className="text-xs">
                    {format(new Date(entry.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm line-clamp-6">{entry.content}</p>
                  
                  {entry.media_url && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">
                        Media ({entry.media_type})
                      </p>
                      <a
                        href={entry.media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline break-all"
                      >
                        {entry.media_url}
                      </a>
                      {entry.media_annotation && (
                        <p className="text-xs mt-2 italic">{entry.media_annotation}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <NewEntryDialog
        open={isNewEntryOpen}
        onOpenChange={setIsNewEntryOpen}
        onEntryCreated={fetchEntries}
      />
    </div>
  );
}
