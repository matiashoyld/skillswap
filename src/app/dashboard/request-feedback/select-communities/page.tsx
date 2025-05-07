import { Suspense } from 'react';
import SelectCommunitiesClientContent from './SelectCommunitiesClientContent';

// This is now a Server Component (or can be)
export default function SelectCommunitiesPage() {
  return (
    <Suspense fallback={<div className="container mx-auto max-w-3xl px-4 py-8">Loading communities...</div>}>
      <SelectCommunitiesClientContent />
    </Suspense>
  );
}
