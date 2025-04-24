'use client';

import React from 'react';
import CurriculumTreeView from '@/components/curriculum/CurriculumTreeView';

interface EditarSecuenciaClientProps {
  curriculumNodes: any[];
}

export default function EditarSecuenciaClient({ curriculumNodes }: EditarSecuenciaClientProps) {
  return (
    <>
      {curriculumNodes.length === 0 ? (
        <p>No hay nodos curriculares para mostrar.</p>
      ) : (
        <CurriculumTreeView nodes={curriculumNodes} initialExpandedNodeIds={[]} defaultExpansionLevel={1} />
      )}
    </>
  );
}
