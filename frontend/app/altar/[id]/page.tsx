'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Wall from '@/components/wall';

export default function AltarViewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id;
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`http://localhost:4000/api/session/${id}`)
      .then(res => res.json())
      .then(data => {
        setSession(data);
        setError(null);
      })
      .catch(err => {
        setError('Failed to load altar.');
        setSession(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-12">Loading altar...</div>;
  if (error || !session) return <div className="text-center py-12 text-red-500">{error || 'Altar not found.'}</div>;

  // Render the altar in view-only mode
  return (
    <div className="max-w-4xl mx-auto py-8 px-2">
      <h1 className="text-3xl font-bold text-center mb-6">{session.name || 'Virtual Altar'}</h1>
      <div className="flex justify-center">
        <Wall
          width={session.data?.wallSize?.width || 600}
          height={session.data?.wallSize?.height || 400}
          background={session.data?.background?.value || '#fff'}
          backgroundSize={session.data?.background?.backgroundSize || 'auto'}
          border={session.data?.wallBorder}
        >
          {(session.data?.blocks || []).map((block: any) => (
            <img
              key={block.id}
              src={block.src && !block.src.startsWith('http') && !block.src.startsWith('data:') ? `/api/images/url/${block.src}` : block.src}
              alt="Altar item"
              style={{
                position: 'absolute',
                left: block.position?.x,
                top: block.position?.y,
                width: block.size?.width,
                height: block.size?.height,
                border: block.border?.width ? `${block.border.width}px ${block.border.style || 'solid'} ${block.border.color}` : undefined,
                borderRadius: block.shape === 'circle' ? '50%' : 8,
                zIndex: block.zIndex || 1,
                background: block.background,
                filter: `brightness(${block.filters?.brightness || 100}%) contrast(${block.filters?.contrast || 100}%) saturate(${block.filters?.saturation || 100}%) blur(${block.filters?.blur || 0}px)`,
                boxShadow: block.frame?.type !== 'none' ? `0 0 0 ${block.frame?.width || 0}px ${block.frame?.color || '#8B4513'}` : undefined,
              }}
            />
          ))}
        </Wall>
      </div>
    </div>
  );
} 