import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  parseAnalyticsPayload,
  recordAnalyticsEvent,
  fetchCreatorMetrics,
} from "./analytics.ts";
import { getServiceClient } from "../_shared/supabase-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method === "POST") {
      const supabase = getServiceClient(req.headers);
      const body = await req.json();
      const payload = parseAnalyticsPayload(body);
      await recordAnalyticsEvent(supabase, payload);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "GET") {
      const url = new URL(req.url);
      const creatorId = url.searchParams.get("creatorId");
      const daysParam = url.searchParams.get("days");

      if (!creatorId) {
        return new Response(
          JSON.stringify({ error: "creatorId is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const days = daysParam ? Number(daysParam) : undefined;
      const supabase = getServiceClient(req.headers);
      const metrics = await fetchCreatorMetrics(supabase, creatorId, days);

      return new Response(
        JSON.stringify(metrics),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response("Method Not Allowed", {
      status: 405,
      headers: { ...corsHeaders, Allow: "GET,POST,OPTIONS" },
    });
  } catch (error) {
    console.error("analytics-processor error", error);
    return new Response(
      JSON.stringify({ error: "Analytics processing failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
