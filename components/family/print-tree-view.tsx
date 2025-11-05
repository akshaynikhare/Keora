'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FamilyMember {
  id: string;
  name: string;
  photoUrl?: string | null;
  dob?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  isPrimary: boolean;
}

interface PrintTreeViewProps {
  members: FamilyMember[];
  paperSize: 'A4' | 'A3' | 'A2';
  onPaperSizeChange: (size: 'A4' | 'A3' | 'A2') => void;
  onClose: () => void;
}

const PAPER_DIMENSIONS = {
  A4: { width: '210mm', height: '297mm', label: 'A4 (210×297mm)' },
  A3: { width: '297mm', height: '420mm', label: 'A3 (297×420mm)' },
  A2: { width: '420mm', height: '594mm', label: 'A2 (420×594mm)' },
};

export default function PrintTreeView({
  members,
  paperSize,
  onPaperSizeChange,
  onClose,
}: PrintTreeViewProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const calculateAge = (dob?: string | null) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Group members by generation for print layout
  const groupedMembers = {
    grandparents: members.filter((m) => !m.isPrimary), // Simplified for demo
    parents: members.filter((m) => !m.isPrimary),
    yourGeneration: members.filter((m) => m.isPrimary),
    children: [],
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
              padding: '20mm',
            }}
          >
            {/* Title Section */}
            <div className="bg-gray-900 text-white p-6 rounded-lg mb-8">
              <h1 className="text-4xl font-bold mb-2">Family Tree</h1>
              <p className="text-gray-300 text-lg">
                {members.find((m) => m.isPrimary)?.name}'s Family
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {members.length} family members • Generated {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Tree Structure */}
            <div className="space-y-8">
              {/* Render members in a clean hierarchical layout */}
              {members.map((member, index) => {
                const age = calculateAge(member.dob);
                const birthYear = member.dob ? new Date(member.dob).getFullYear() : null;
                const bgColor =
                  member.gender === 'MALE'
                    ? 'bg-blue-100'
                    : member.gender === 'FEMALE'
                    ? 'bg-pink-100'
                    : 'bg-purple-100';
                const borderColor =
                  member.gender === 'MALE'
                    ? 'border-blue-400'
                    : member.gender === 'FEMALE'
                    ? 'border-pink-400'
                    : 'border-purple-400';

                return (
                  <div
                    key={member.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 ${bgColor} ${borderColor}`}
                  >
                    {/* Photo */}
                    <div
                      className={`w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-4 ${borderColor}`}
                    >
                      {member.photoUrl ? (
                        <img
                          src={member.photoUrl}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white font-bold text-xl">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        {member.name}
                        {member.isPrimary && (
                          <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full">
                            ⭐ Primary
                          </span>
                        )}
                      </h3>
                      {birthYear && (
                        <p className="text-sm text-gray-700">
                          Born: {birthYear}
                          {age && ` (Age: ${age})`}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t text-center text-gray-500 text-sm">
              <p>Created with Keora Family Tree Builder</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: ${dimensions.width} ${dimensions.height};
            margin: 0;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
