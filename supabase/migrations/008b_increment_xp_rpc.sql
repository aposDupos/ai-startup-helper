-- Migration 008b: increment_xp RPC function
-- Securely increments user XP from client-side without direct table access

CREATE OR REPLACE FUNCTION public.increment_xp(user_id_param UUID, xp_amount INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.profiles
  SET xp = COALESCE(xp, 0) + xp_amount
  WHERE id = user_id_param;
END;
$function$;
