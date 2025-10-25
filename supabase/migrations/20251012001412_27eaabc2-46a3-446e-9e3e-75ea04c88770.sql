-- Add DELETE policy for challenge_progress table
CREATE POLICY "Users can delete own progress"
ON public.challenge_progress
FOR DELETE
USING (auth.uid() = user_id);