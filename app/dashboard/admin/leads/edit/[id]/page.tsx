"use client";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import EditLeadForm from "@/components/leads/EditLeadForm";
import { use } from "react";

export default function EditLeadModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params); // Next.js 15+ e params promise hoy
  const id = resolvedParams.id;
  console.log(id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-7xl rounded-3xl shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => router.back()}
          className="absolute right-4 top-4 p-2 hover:bg-slate-100 rounded-full z-10 bg-white shadow-sm"
        >
          <X className="w-6 h-6 text-slate-600" />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6">Edit Lead</h2>
          {/* Form e id pass korchi */}
          <EditLeadForm id={id} />
        </div>
      </div>
    </div>
  );
}
