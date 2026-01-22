-- Allow authenticated users to insert projects they create.
CREATE POLICY "Authenticated users can insert projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

