import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ALL_TOPICS_CATEGORY } from "@/constants/dashboard";
import { api } from "@/services/api";
import { ApiError } from "@/services/http";
import { saveSessionToken } from "@/services/session-token";
import type { Health, Topic } from "@/types/api";

export function useDashboard() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [health, setHealth] = useState<Health | null>(null);
  const [category, setCategory] = useState(ALL_TOPICS_CATEGORY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingTopic, setStartingTopic] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([api.getTopics(), api.getHealth().catch(() => null)])
      .then(([topicList, healthResult]) => {
        if (!active) return;
        setTopics(topicList);
        setHealth(healthResult);
      })
      .catch((exc) => {
        if (active) setError(exc instanceof Error ? exc.message : "Could not load topics.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => [ALL_TOPICS_CATEGORY, ...Array.from(new Set(topics.map((topic) => topic.category)))],
    [topics],
  );

  const visibleTopics = useMemo(
    () =>
      category === ALL_TOPICS_CATEGORY
        ? topics
        : topics.filter((topic) => topic.category === category),
    [category, topics],
  );

  const startPractice = async (topic: Topic) => {
    setStartingTopic(topic.id);
    setError(null);
    try {
      const created = await api.createSession(topic.id);
      saveSessionToken(created.session.id, created.access_token);
      navigate(`/practice/${created.session.id}`);
    } catch (exc) {
      setError(
        exc instanceof ApiError ? exc.message : "Could not start a practice session. Try again.",
      );
    } finally {
      setStartingTopic(null);
    }
  };

  return {
    topics,
    health,
    category,
    setCategory,
    categories,
    visibleTopics,
    loading,
    error,
    startingTopic,
    startPractice,
    voiceUnavailable: health ? !health.voice_ready : false,
  };
}
