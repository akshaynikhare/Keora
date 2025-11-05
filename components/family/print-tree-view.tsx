'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dynamic from 'next/dynamic';

const InteractiveTreeView = dynamic(
  () => import('./interactive-tree-view'),
  { ssr: false }
);

interface FamilyMember {
  id: string;
  name: string;
  photoUrl?: string | null;
  dob?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  isPrimary: boolean;
  relationshipsFrom: Array<{
    id: string;
    memberId1: string;
    memberId2: string;
    relationshipType: string;
    member2: {
      id: string;
      name: string;
    };
  }>;
  relationshipsTo: Array<{
    id: string;
    memberId1: string;
    memberId2: string;
    relationshipType: string;
    member1: {
      id: string;
      name: string;
    };
  }>;
}

interface PrintTreeViewProps {
  members: FamilyMember[];
  paperSize: 'A4' | 'A3' | 'A2';
  onPaperSizeChange: (size: 'A4' | 'A3' | 'A2') => void;
  onClose: () => void;
  showLegend?: boolean;
}

const PAPER_DIMENSIONS = {
  A4: { width: '297mm', height: '210mm', label: 'A4 Landscape (297×210mm)' },
  A3: { width: '420mm', height: '297mm', label: 'A3 Landscape (420×297mm)' },
  A2: { width: '594mm', height: '420mm', label: 'A2 Landscape (594×420mm)' },
};

export default function PrintTreeView({
  members,
  paperSize,
  onPaperSizeChange,
  onClose,
  showLegend = true,
}: PrintTreeViewProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const dimensions = PAPER_DIMENSIONS[paperSize];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-auto">
        {/* Header with controls */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Print Preview</h2>
            <Select value={paperSize} onValueChange={(value: any) => onPaperSizeChange(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select paper size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">{PAPER_DIMENSIONS.A4.label}</SelectItem>
                <SelectItem value="A3">{PAPER_DIMENSIONS.A3.label}</SelectItem>
                <SelectItem value="A2">{PAPER_DIMENSIONS.A2.label}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePrint} size="lg">
              🖨️ Print
            </Button>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>

        {/* Print area */}
        <div className="p-8 flex justify-center">
          <div
            ref={printAreaRef}
            className="bg-white shadow-lg"
            style={{
              width: dimensions.width,
              height: dimensions.height,
              padding: '10mm',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Title Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg mb-4 print:mb-2">
              <h1 className="text-3xl font-bold mb-1">Family Tree</h1>
              <p className="text-white text-sm">
                {members.find((m) => m.isPrimary)?.name}'s Family • {members.length} members • {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Tree Visualization */}
            <div className="flex-1 relative bg-slate-50 rounded-lg border-2 border-slate-200 overflow-hidden">
              <InteractiveTreeView members={members} orientation="TB" />
            </div>

            {/* Footer */}
            <div className="mt-2 text-center text-gray-500 text-xs print:text-[10px]">
              <p>Created with Keora Family Tree Builder</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: ${dimensions.width} ${dimensions.height} landscape;
            margin: 0;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print\\:hidden {
            display: none !important;
          }

          .print\\:mb-2 {
            margin-bottom: 0.5rem !important;
          }

          .print\\:text-\\[10px\\] {
            font-size: 10px !important;
          }

          /* Hide ReactFlow controls in print */
          .react-flow__controls,
          .react-flow__panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
