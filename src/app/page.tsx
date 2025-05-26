import { LinkForm } from '@/components/LinkForm';
import { DigestView } from '@/components/DigestView';

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Content Digest</h1>
        <LinkForm />
        <DigestView />
      </main>
    </div>
  );
}
