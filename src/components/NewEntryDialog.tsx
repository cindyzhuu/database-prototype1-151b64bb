import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type NewEntryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEntryCreated: () => void;
};

export function NewEntryDialog({ open, onOpenChange, onEntryCreated }: NewEntryDialogProps) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("thoughts");
  const [mediaType, setMediaType] = useState("text");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaAnnotation, setMediaAnnotation] = useState("");
  const [vibe, setVibe] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to create entries.",
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      content: content.trim(),
      category,
      media_type: mediaType,
      media_url: mediaUrl.trim() || null,
      media_annotation: mediaAnnotation.trim() || null,
      vibe: vibe || null,
    });

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create entry. Please try again.",
      });
    } else {
      toast({
        title: "Success!",
        description: "Your journal entry has been created.",
      });
      
      // Reset form
      setContent("");
      setCategory("thoughts");
      setMediaType("text");
      setMediaUrl("");
      setMediaAnnotation("");
      setVibe("");
      
      onOpenChange(false);
      onEntryCreated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Entry</DialogTitle>
          <DialogDescription>
            Capture your thoughts, wishes, or reflections.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Your Entry *</Label>
            <Textarea
              id="content"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={6}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thoughts">Thoughts</SelectItem>
                  <SelectItem value="wishes">Wishes</SelectItem>
                  <SelectItem value="grievances">Grievances</SelectItem>
                  <SelectItem value="reflection">Reflection</SelectItem>
                  <SelectItem value="gratitude">Gratitude</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="media-type">Media Type *</Label>
              <Select value={mediaType} onValueChange={setMediaType}>
                <SelectTrigger id="media-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="voice">Voice</SelectItem>
                  <SelectItem value="annotated_media_link">Media Link</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vibe">Vibe (optional)</Label>
            <Select value={vibe} onValueChange={setVibe}>
              <SelectTrigger id="vibe">
                <SelectValue placeholder="Select a vibe..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
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

          {(mediaType === "annotated_media_link" || mediaType === "image" || mediaType === "video") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="media-url">Media URL</Label>
                <Input
                  id="media-url"
                  type="url"
                  placeholder="https://example.com/media"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="media-annotation">Media Annotation</Label>
                <Textarea
                  id="media-annotation"
                  placeholder="Your thoughts about this media..."
                  value={mediaAnnotation}
                  onChange={(e) => setMediaAnnotation(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
