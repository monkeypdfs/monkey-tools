"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Alert, AlertTitle, AlertDescription } from "@workspace/ui/components/alert";
import { Trash2, Copy, FileText, Hash, Type, AlignLeft, CheckCircle } from "lucide-react";

interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
  sentences: number;
}

export default function CharacterCounter() {
  const [text, setText] = useState("");

  // Calculate text statistics
  const stats: TextStats = useMemo(() => {
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text.split("\n").length;
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;

    return {
      characters,
      charactersNoSpaces,
      words,
      lines,
      paragraphs,
      sentences,
    };
  }, [text]);

  // Copy text to clipboard
  const copyText = useCallback(async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      // Could add toast here if needed
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  }, [text]);

  // Clear all text
  const clearText = useCallback(() => {
    setText("");
  }, []);

  // Copy statistics
  const copyStats = useCallback(async () => {
    const statsText = `Characters: ${stats.characters}
Characters (no spaces): ${stats.charactersNoSpaces}
Words: ${stats.words}
Lines: ${stats.lines}
Paragraphs: ${stats.paragraphs}
Sentences: ${stats.sentences}`;

    try {
      await navigator.clipboard.writeText(statsText);
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = statsText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  }, [stats]);

  return (
    <div className="w-full">
      {/* Text Input Section */}
      <section aria-labelledby="text-input" className="max-w-4xl mx-auto">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Label htmlFor="text-input" className="text-sm font-medium">
              Enter your text
            </Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyText} disabled={!text} className="flex-1 h-8 sm:flex-none">
                <Copy className="w-3 h-3 mr-1" />
                Copy Text
              </Button>
              <Button variant="outline" size="sm" onClick={clearText} disabled={!text} className="flex-1 h-8 sm:flex-none">
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>

          <textarea
            id="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing or paste your text here..."
            className="w-full h-32 p-4 text-base border rounded-lg resize-none sm:h-48 bg-background border-border focus:ring-2 focus:ring-primary focus:border-transparent"
            spellCheck="false"
          />
        </div>
      </section>

      {/* Statistics Display */}
      <section aria-labelledby="statistics" className="max-w-4xl mx-auto mt-8">
        <div className="space-y-6">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg bg-card border-border">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Characters</span>
              </div>
              <div className="text-2xl font-bold">{stats.characters.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{stats.charactersNoSpaces.toLocaleString()} without spaces</div>
            </div>

            <div className="p-4 border rounded-lg bg-card border-border">
              <div className="flex items-center gap-2 mb-2">
                <Type className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Words</span>
              </div>
              <div className="text-2xl font-bold">{stats.words.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                {stats.words > 0 ? (stats.characters / stats.words).toFixed(1) : "0"} avg length
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-card border-border sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-2">
                <AlignLeft className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Lines</span>
              </div>
              <div className="text-2xl font-bold">{stats.lines.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{stats.paragraphs.toLocaleString()} paragraphs</div>
            </div>

            <div className="p-4 border rounded-lg bg-card border-border sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Sentences</span>
              </div>
              <div className="text-2xl font-bold">{stats.sentences.toLocaleString()}</div>
              <div className="flex gap-4 mt-2">
                <Button variant="outline" size="sm" onClick={copyStats} className="flex-1 text-xs h-7 sm:flex-none">
                  <Copy className="w-3 h-3 mr-1" />
                  Copy Stats
                </Button>
              </div>
            </div>
          </div>

          {/* Reading Time Estimate */}
          {stats.words > 0 && (
            <div className="p-4 border rounded-lg bg-card border-border">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-center sm:text-left">
                  <div className="text-sm font-medium text-muted-foreground">Estimated Reading Time</div>
                  <div className="text-lg font-semibold">
                    {Math.ceil(stats.words / 200)} minute{Math.ceil(stats.words / 200) !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-sm text-muted-foreground">Speaking Time</div>
                  <div className="text-lg font-semibold">
                    {Math.ceil(stats.words / 150)} minute{Math.ceil(stats.words / 150) !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Tips */}
      <Alert className="max-w-4xl p-4 mx-auto mt-6 border-blue-500 sm:p-6 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
        <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
        <AlertTitle className="text-base text-blue-800 dark:text-blue-200 sm:text-lg">Text Analysis Tips</AlertTitle>
        <AlertDescription className="mt-3 text-blue-700 dark:text-blue-300">
          <ul className="space-y-2 text-sm leading-relaxed sm:space-y-1 sm:text-base">
            <li className="pl-1">Character count includes spaces and punctuation</li>
            <li className="pl-1">Words are counted by spaces (contractions count as one word)</li>
            <li className="pl-1">Paragraphs are separated by blank lines</li>
            <li className="pl-1">Sentences are detected by periods, exclamation marks, and question marks</li>
            <li className="pl-1">Reading time is estimated at 200 words per minute</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
