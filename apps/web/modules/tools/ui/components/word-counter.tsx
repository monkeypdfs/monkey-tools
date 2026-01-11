"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Alert, AlertTitle, AlertDescription } from "@workspace/ui/components/alert";
import { Trash2, Copy, BookOpen, Clock, TrendingUp, Hash, CheckCircle } from "lucide-react";

interface WordStats {
  totalWords: number;
  uniqueWords: number;
  characters: number;
  averageWordLength: number;
  longestWord: string;
  shortestWord: string;
  mostFrequentWords: Array<{ word: string; count: number }>;
}

export default function WordCounter() {
  const [text, setText] = useState("");

  // Calculate word statistics
  const stats: WordStats = useMemo(() => {
    if (!text.trim()) {
      return {
        totalWords: 0,
        uniqueWords: 0,
        characters: 0,
        averageWordLength: 0,
        longestWord: "",
        shortestWord: "",
        mostFrequentWords: [],
      };
    }

    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const totalWords = words.length;
    const characters = text.replace(/\s/g, "").length;

    // Unique words
    const wordFrequency = new Map<string, number>();
    words.forEach((word) => {
      wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
    });
    const uniqueWords = wordFrequency.size;

    // Word lengths
    const wordLengths = words.map((word) => word.length);
    const averageWordLength = wordLengths.reduce((sum, len) => sum + len, 0) / totalWords;

    // Longest and shortest words
    const sortedByLength = [...new Set(words)].sort((a, b) => b.length - a.length);
    const longestWord = sortedByLength[0] || "";
    const shortestWord = sortedByLength[sortedByLength.length - 1] || "";

    // Most frequent words (top 5)
    const mostFrequentWords = Array.from(wordFrequency.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word, count]) => ({ word, count }));

    return {
      totalWords,
      uniqueWords,
      characters,
      averageWordLength: Math.round(averageWordLength * 10) / 10,
      longestWord,
      shortestWord,
      mostFrequentWords,
    };
  }, [text]);

  // Copy text to clipboard
  const copyText = useCallback(async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
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
    const statsText = `Total Words: ${stats.totalWords}
Unique Words: ${stats.uniqueWords}
Characters: ${stats.characters}
Average Word Length: ${stats.averageWordLength}
Longest Word: ${stats.longestWord}
Shortest Word: ${stats.shortestWord}
Most Frequent Words:
${stats.mostFrequentWords.map((item) => `${item.word}: ${item.count}`).join("\n")}`;

    try {
      await navigator.clipboard.writeText(statsText);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = statsText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  }, [stats]);

  // Reading time calculations
  const readingTime = useMemo(() => {
    if (stats.totalWords === 0) return { slow: 0, average: 0, fast: 0 };

    return {
      slow: Math.ceil(stats.totalWords / 150), // 150 WPM (slow reader)
      average: Math.ceil(stats.totalWords / 200), // 200 WPM (average)
      fast: Math.ceil(stats.totalWords / 250), // 250 WPM (fast reader)
    };
  }, [stats.totalWords]);

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
            placeholder="Start typing or paste your text here to analyze word statistics..."
            className="w-full h-32 p-4 text-base border rounded-lg resize-none sm:h-48 bg-background border-border focus:ring-2 focus:ring-primary focus:border-transparent"
            spellCheck="false"
          />
        </div>
      </section>

      {/* Statistics Display */}
      {stats.totalWords > 0 && (
        <section aria-labelledby="statistics" className="max-w-4xl mx-auto mt-8">
          <div className="space-y-6">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 border rounded-lg bg-card border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Total Words</span>
                </div>
                <div className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</div>
              </div>

              <div className="p-4 border rounded-lg bg-card border-border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Unique Words</span>
                </div>
                <div className="text-2xl font-bold">{stats.uniqueWords.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">
                  {stats.totalWords > 0 ? Math.round((stats.uniqueWords / stats.totalWords) * 100) : 0}% unique
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-card border-border">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Avg Word Length</span>
                </div>
                <div className="text-2xl font-bold">{stats.averageWordLength}</div>
                <div className="text-xs text-muted-foreground">characters</div>
              </div>

              <div className="p-4 border rounded-lg bg-card border-border sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Reading Time</span>
                </div>
                <div className="text-2xl font-bold">{readingTime.average}m</div>
                <div className="text-xs text-muted-foreground">
                  {readingTime.slow}-{readingTime.fast} min
                </div>
              </div>
            </div>

            {/* Word Analysis */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Word Length Analysis */}
              <div className="p-4 border rounded-lg bg-card border-border">
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">Word Length Analysis</h3>
                <div className="space-y-2">
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center">
                    <span className="text-sm">Longest word:</span>
                    <span className="text-sm font-medium break-all">{stats.longestWord || "N/A"}</span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center">
                    <span className="text-sm">Shortest word:</span>
                    <span className="text-sm font-medium">{stats.shortestWord || "N/A"}</span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center">
                    <span className="text-sm">Total characters:</span>
                    <span className="text-sm font-medium">{stats.characters.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Most Frequent Words */}
              <div className="p-4 border rounded-lg bg-card border-border">
                <div className="flex flex-col gap-3 mb-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">Most Frequent Words</h3>
                  <Button variant="outline" size="sm" onClick={copyStats} className="w-full text-xs h-7 sm:w-auto">
                    <Copy className="w-3 h-3 mr-1" />
                    Copy Stats
                  </Button>
                </div>
                <div className="space-y-2">
                  {stats.mostFrequentWords.length > 0 ? (
                    stats.mostFrequentWords.map((item, index) => (
                      <div key={item.word} className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center">
                        <span className="flex items-center gap-2 text-sm">
                          <span className="flex items-center justify-center w-4 h-4 text-xs font-medium rounded bg-primary/10 text-primary">
                            {index + 1}
                          </span>
                          <span className="break-all">{item.word}</span>
                        </span>
                        <span className="text-sm font-medium">{item.count}x</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No words to analyze</div>
                  )}
                </div>
              </div>
            </div>

            {/* Reading Time Details */}
            <div className="p-4 border rounded-lg bg-card border-border">
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Reading Time Estimates</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="p-3 text-center rounded-lg bg-green-50 dark:bg-green-950/20">
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">{readingTime.fast}m</div>
                  <div className="text-xs text-muted-foreground">
                    Fast Reader
                    <br />
                    (250 WPM)
                  </div>
                </div>
                <div className="p-3 text-center rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">{readingTime.average}m</div>
                  <div className="text-xs text-muted-foreground">
                    Average
                    <br />
                    (200 WPM)
                  </div>
                </div>
                <div className="p-3 text-center rounded-lg bg-orange-50 dark:bg-orange-950/20">
                  <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">{readingTime.slow}m</div>
                  <div className="text-xs text-muted-foreground">
                    Slow Reader
                    <br />
                    (150 WPM)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tips */}
      <Alert className="max-w-4xl p-4 mx-auto mt-6 border-blue-500 sm:p-6 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
        <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
        <AlertTitle className="text-base text-blue-800 dark:text-blue-200 sm:text-lg">Word Analysis Tips</AlertTitle>
        <AlertDescription className="mt-3 text-blue-700 dark:text-blue-300">
          <ul className="space-y-2 text-sm leading-relaxed sm:space-y-1 sm:text-base">
            <li className="pl-1">Words are identified using word boundaries (letters, numbers, and underscores)</li>
            <li className="pl-1">Frequency analysis is case-insensitive</li>
            <li className="pl-1">Reading time estimates are based on standard words per minute rates</li>
            <li className="pl-1">Unique words percentage shows vocabulary diversity</li>
            <li className="pl-1">Short words (1-2 characters) are often filtered out as common words</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
