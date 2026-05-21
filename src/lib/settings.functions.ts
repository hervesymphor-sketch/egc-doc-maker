import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

export const getSchoolSettings = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("school_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { settings: data };
  });

export const updateSchoolSettings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().min(1).max(200),
        rne: z.string().max(50).optional().default(""),
        address: z.string().max(500).optional().default(""),
        city: z.string().max(200).optional().default(""),
        postal_code: z.string().max(20).optional().default(""),
        signatory_name: z.string().max(200).optional().default(""),
        signatory_title: z.string().max(200).optional().default(""),
        logo_url: z.string().max(1000).optional().default(""),
        google_sheet_id: z.string().min(10).max(200),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { id, ...patch } = data;
    const { error } = await supabaseAdmin
      .from("school_settings")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
