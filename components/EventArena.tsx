"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { BLIND_LABELS } from "@/lib/constants";
import type { BlindModel, RevealedModel, EventStatus, ScoringType, SSEChunk } from "@/lib/types";
import { ModelCard } from "./ModelCard";
import { SliderVote } from "./SliderVote";
import { VoteReveal } from "./VoteReveal";
import { CountdownTimer } from "./CountdownTimer";

interface EventArenaProps {
  eventId: string;
  eventName: string;
  eventIcon: string;
  eventDescription: string;
  eventNumber: number;
  totalEvents: number;
  scheduledAt: string;
  votingClosesAt: string;
  scoringType: ScoringType;
  initialStatus: EventStatus;
  initialResponses?: BlindModel[];
}

export function EventArena({
  eventId,
  eventName,
  eventIcon,
  eventDescription,
  eventNumber,
  totalEvents,
  scheduledAt,
  votingClosesAt,
  scoringType,
  initialStatus,
  initialResponses,
}: EventArenaProps) {
  const [status, setStatus] = useState<EventStatus>(initialStatus);
  const [streamedContent, setStreamedContent] = useState<Record<number, string>>({});
  const [streamingModels, setStreamingModels] = useState<Set<number>>(new Set());
  const [blindResponses, setBlindResponses] = useState<BlindModel[]>(initialResponses ?? []);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedIndex, setVotedIndex] = useState<number | null>(null);
  const [revealData, setRevealData] = useState<RevealedModel[] | null>(null);
  const [revealComplete, setRevealComplete] = useState(false);
  const [voteConfirmed, setVoteConfirmed] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Check localStorage for previous vote
  useEffect(() => {
    const stored = localStorage.getItem(`vote_${eventId}`);
    if (stored) {
      const data = JSON.parse(stored);
      setHasVoted(true);
      setVotedIndex(data.votedIndex);
      setRevealData(data.reveal);
      setRevealComplete(true);
    }
  }, [eventId]);

  // Poll for status changes
  useEffect(() => {
    if (status === "closed" && revealComplete) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/event/${eventId}/blind-responses`);
        const data = await res.json();
        if (data.status !== status) {
          setStatus(data.status);
        }
        if (data.responses && data.responses.length > 0) {
          setBlindResponses(data.responses);
        }
      } catch {
        // ignore polling errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [eventId, status, revealComplete]);

  // SSE streaming for generation
  useEffect(() => {
    if (status !== "generating") return;

    const eventSource = new EventSource(`/api/generate?event_id=${eventId}`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (e) => {
      if (e.data === "[DONE]") {
        eventSource.close();
        return;
      }

      try {
        const chunk: SSEChunk = JSON.parse(e.data);
        if (chunk.done) {
          setStreamingModels((prev) => {
            const next = new Set(prev);
            next.delete(chunk.modelIndex);
            return next;
          });
        } else {
          setStreamingModels((prev) => new Set(prev).add(chunk.modelIndex));
          setStreamedContent((prev) => ({
            ...prev,
            [chunk.modelIndex]: (prev[chunk.modelIndex] ?? "") + chunk.delta,
          }));
        }
      } catch {
        // ignore parse errors
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [status, eventId]);

  // Handle vote submission
  const handleVote = useCallback(
    async (modelIndex: number, scores?: Record<string, number>) => {
      try {
        const res = await fetch("/api/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_id: eventId,
            model_index: modelIndex,
            scores,
          }),
        });

        if (res.status === 409) {
          // Already voted
          setHasVoted(true);
          return;
        }

        if (!res.ok) return;

        const data = await res.json();
        setHasVoted(true);
        setVotedIndex(modelIndex);
        setVoteConfirmed(true);
        setRevealData(data.reveal);

        // Save to localStorage
        localStorage.setItem(
          `vote_${eventId}`,
          JSON.stringify({ votedIndex: modelIndex, reveal: data.reveal })
        );
      } catch (err) {
        console.error("Vote failed:", err);
      }
    },
    [eventId]
  );

  const handleRevealComplete = useCallback(() => {
    setRevealComplete(true);
  }, []);

  // Get content for a blind index
  const getContent = (index: number): string => {
    // Prefer streamed content during generation
    if (streamedContent[index]) return streamedContent[index];
    // Fall back to fetched blind responses
    return blindResponses.find((r) => r.index === index)?.content ?? "";
  };

  // ---- UPCOMING STATE ----
  if (status === "upcoming") {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ fontSize: 7, color: "#888", marginBottom: 8 }}>
          EVENT {String(eventNumber).padStart(2, "0")} / {String(totalEvents).padStart(2, "0")}
        </div>
        <div style={{ fontSize: 14, marginBottom: 8 }}>
          {eventIcon} {eventName}
        </div>
        <div style={{ fontSize: 7, color: "#aaa", lineHeight: 2, marginBottom: 20 }}>
          {eventDescription}
        </div>
        <CountdownTimer label="EVENT STARTS IN" targetDate={scheduledAt} />
      </div>
    );
  }

  // ---- GENERATING / VOTING / CLOSED STATES ----
  const numModels = BLIND_LABELS.length;

  // Show vote confirmation overlay briefly after voting
  if (voteConfirmed && revealData && !revealComplete) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ fontSize: 7, color: "#888", marginBottom: 8 }}>
          EVENT {String(eventNumber).padStart(2, "0")} / {String(totalEvents).padStart(2, "0")}
        </div>
        <div style={{ fontSize: 14, marginBottom: 16 }}>
          {eventIcon} {eventName}
        </div>

        {/* Vote confirmed box */}
        <div
          className="pixelflash"
          style={{
            border: "3px solid #FFD700",
            boxShadow: "4px 4px 0 #FFD700",
            padding: 16,
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 8, color: "#FFD700", marginBottom: 6 }}>VOTE RECORDED ★</div>
          <div style={{ fontSize: 7, color: "#888" }}>REVEALING MODELS...</div>
        </div>

        <VoteReveal
          revealData={revealData}
          votedModelIndex={votedIndex ?? -1}
          onRevealComplete={handleRevealComplete}
        />
      </div>
    );
  }

  // Show fully revealed state (after reveal animation or for closed events)
  if ((hasVoted && revealComplete && revealData) || status === "closed") {
    const displayData = revealData;

    // For closed events without vote data, fetch results
    if (!displayData && status === "closed") {
      return (
        <div style={{ padding: 24 }}>
          <div style={{ fontSize: 7, color: "#888", marginBottom: 8 }}>
            EVENT {String(eventNumber).padStart(2, "0")} / {String(totalEvents).padStart(2, "0")}
          </div>
          <div style={{ fontSize: 14, marginBottom: 16 }}>
            {eventIcon} {eventName}
          </div>
          <ClosedEventView eventId={eventId} votedIndex={votedIndex} />
        </div>
      );
    }

    if (displayData) {
      const totalVotes = displayData.reduce((sum, m) => sum + m.votes, 0);
      return (
        <div style={{ padding: 24 }}>
          <div style={{ fontSize: 7, color: "#888", marginBottom: 8 }}>
            EVENT {String(eventNumber).padStart(2, "0")} / {String(totalEvents).padStart(2, "0")}
          </div>
          <div style={{ fontSize: 14, marginBottom: 16 }}>
            {eventIcon} {eventName}
          </div>

          {hasVoted && (
            <div
              style={{
                border: "3px solid #FFD700",
                boxShadow: "4px 4px 0 #FFD700",
                padding: 16,
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 8, color: "#FFD700", marginBottom: 6 }}>VOTE RECORDED ★</div>
              <div style={{ fontSize: 7, color: "#888" }}>{totalVotes} total votes</div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {displayData.map((model) => (
              <ModelCard
                key={model.index}
                blindLabel={model.label}
                content={model.content}
                revealed
                modelName={model.name}
                flagEmoji={model.flag_emoji}
                countryCode={model.country_code}
                color={model.color}
                votedFor={model.index === votedIndex}
                votes={model.votes}
                totalVotes={totalVotes}
              />
            ))}
          </div>
        </div>
      );
    }
  }

  // ---- GENERATING / VOTING (blind mode) ----
  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 7, color: "#888", marginBottom: 8 }}>
        EVENT {String(eventNumber).padStart(2, "0")} / {String(totalEvents).padStart(2, "0")}
      </div>
      <div style={{ fontSize: 14, marginBottom: 8 }}>
        {eventIcon} {eventName}
      </div>
      <div style={{ fontSize: 7, color: "#aaa", lineHeight: 2, marginBottom: 20 }}>
        {eventDescription}
      </div>

      {status === "voting" && (
        <CountdownTimer label="VOTING CLOSES IN" targetDate={votingClosesAt} />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {Array.from({ length: numModels }, (_, i) => {
          const content = getContent(i);
          const isStreaming = streamingModels.has(i);

          return (
            <div key={i}>
              <ModelCard
                blindLabel={BLIND_LABELS[i]}
                content={content}
                isStreaming={isStreaming}
                votingEnabled={status === "voting" && scoringType === "pick"}
                onVote={() => handleVote(i)}
              />
              {status === "voting" && scoringType === "slider" && content && (
                <SliderVote
                  blindLabel={BLIND_LABELS[i]}
                  onSubmit={(scores) => handleVote(i, scores)}
                />
              )}
              {status === "voting" && scoringType === "auto_vote" && content && (
                <div style={{ marginTop: 8 }}>
                  <button
                    className="pixel-btn"
                    onClick={() => handleVote(i)}
                    style={{
                      background: "transparent",
                      color: "#888",
                      borderColor: "#888",
                      boxShadow: "4px 4px 0 #888",
                      fontSize: 8,
                      width: "100%",
                    }}
                  >
                    VOTE ►
                  </button>
                </div>
              )}
              {status === "voting" && scoringType === "hybrid" && content && (
                <div style={{ marginTop: 8 }}>
                  <button
                    className="pixel-btn"
                    onClick={() => handleVote(i)}
                    style={{
                      background: "transparent",
                      color: "#888",
                      borderColor: "#888",
                      boxShadow: "4px 4px 0 #888",
                      fontSize: 8,
                      width: "100%",
                    }}
                  >
                    VOTE ►
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Sub-component for closed events (fetches results via polling)
function ClosedEventView({
  eventId,
  votedIndex,
}: {
  eventId: string;
  votedIndex: number | null;
}) {
  const [data, setData] = useState<RevealedModel[] | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    fetch(`/api/results/${eventId}`)
      .then((r) => r.json())
      .then((result) => {
        setData(result.models);
        setTotalVotes(result.total_votes);
      })
      .catch(() => {});
  }, [eventId]);

  if (!data) {
    return (
      <div style={{ fontSize: 7, color: "#888", textAlign: "center", padding: 40 }}>
        LOADING RESULTS...
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {data.map((model) => (
        <ModelCard
          key={model.index}
          blindLabel={model.label}
          content={model.content}
          revealed
          modelName={model.name}
          flagEmoji={model.flag_emoji}
          countryCode={model.country_code}
          color={model.color}
          votedFor={model.index === votedIndex}
          votes={model.votes}
          totalVotes={totalVotes}
        />
      ))}
    </div>
  );
}
