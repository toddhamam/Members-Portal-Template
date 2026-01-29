"use client";

import { useState, useEffect } from "react";

interface Automation {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_config: Record<string, string> | null;
  message_template: string;
  is_enabled: boolean;
  delay_minutes: number;
  sent_count: number;
  created_at: string;
}

const MEMBER_TYPE_LABELS: Record<string, string> = {
  all: "All Members",
  free: "Free Members Only",
  paid: "Paid Members Only",
};

const TRIGGER_LABELS: Record<string, string> = {
  welcome: "New Member Welcome",
  purchase: "Any Product Purchase",
  purchase_specific: "Specific Product Purchase",
  course_started: "Course Started",
  course_progress_25: "25% Course Progress",
  course_progress_50: "50% Course Progress",
  course_progress_75: "75% Course Progress",
  course_completed: "Course Completed",
  inactivity_7d: "7 Days Inactive",
  inactivity_14d: "14 Days Inactive",
  inactivity_30d: "30 Days Inactive",
  anniversary_30d: "30 Day Anniversary",
  anniversary_90d: "90 Day Anniversary",
  anniversary_1y: "1 Year Anniversary",
  first_community_post: "First Community Post",
};

function AutomationCard({ automation, onToggle, onEdit }: {
  automation: Automation;
  onToggle: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800 truncate">{automation.name}</h3>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              automation.is_enabled
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-500"
            }`}>
              {automation.is_enabled ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {TRIGGER_LABELS[automation.trigger_type] || automation.trigger_type}
            {automation.trigger_type === "welcome" && automation.trigger_config?.member_type && (
              <span className="ml-2 text-xs text-slate-400">
                ({MEMBER_TYPE_LABELS[automation.trigger_config.member_type] || automation.trigger_config.member_type})
              </span>
            )}
          </p>
          {automation.description && (
            <p className="text-sm text-slate-400 mt-2 line-clamp-2">
              {automation.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
            <span>{automation.sent_count} sent</span>
            {automation.delay_minutes > 0 && (
              <span>{automation.delay_minutes} min delay</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onToggle}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              automation.is_enabled ? "bg-green-500" : "bg-slate-300"
            }`}
            title={automation.is_enabled ? "Disable" : "Enable"}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${
                automation.is_enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400 mb-1">Message Preview:</p>
        <p className="text-sm text-slate-600 line-clamp-2 whitespace-pre-line">
          {automation.message_template}
        </p>
      </div>
    </div>
  );
}

function EditModal({ automation, onClose, onSave }: {
  automation: Automation | null;
  onClose: () => void;
  onSave: (data: Partial<Automation> & { trigger_config?: Record<string, string> }) => void;
}) {
  const [formData, setFormData] = useState({
    name: automation?.name || "",
    description: automation?.description || "",
    trigger_type: automation?.trigger_type || "welcome",
    message_template: automation?.message_template || "",
    delay_minutes: automation?.delay_minutes || 0,
    is_enabled: automation?.is_enabled || false,
    member_type: automation?.trigger_config?.member_type || "all",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Build trigger_config based on trigger type
    const trigger_config: Record<string, string> = {};
    if (formData.trigger_type === "welcome" && formData.member_type !== "all") {
      trigger_config.member_type = formData.member_type;
    }

    await onSave({
      name: formData.name,
      description: formData.description,
      trigger_type: formData.trigger_type,
      message_template: formData.message_template,
      delay_minutes: formData.delay_minutes,
      is_enabled: formData.is_enabled,
      trigger_config,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {automation ? "Edit Automation" : "New Automation"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Trigger</label>
            <select
              value={formData.trigger_type}
              onChange={(e) => setFormData({ ...formData, trigger_type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {Object.entries(TRIGGER_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Member Type Filter - only for welcome trigger */}
          {formData.trigger_type === "welcome" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Send To</label>
              <select
                value={formData.member_type}
                onChange={(e) => setFormData({ ...formData, member_type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="all">All New Members</option>
                <option value="free">Free Members Only</option>
                <option value="paid">Paid Members Only</option>
              </select>
              <p className="text-xs text-slate-400 mt-1">
                Free = signed up without purchasing. Paid = made at least one purchase.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Message Template</label>
            <textarea
              value={formData.message_template}
              onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[120px]"
              required
            />
            <p className="text-xs text-slate-400 mt-1">
              Available variables: {"{{member_name}}"}, {"{{member_first_name}}"}, {"{{product_name}}"}, {"{{progress_percent}}"}, {"{{days_since_join}}"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Delay (minutes)</label>
            <input
              type="number"
              min="0"
              value={formData.delay_minutes}
              onChange={(e) => setFormData({ ...formData, delay_minutes: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Wait this many minutes before sending. 0 = send immediately.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_enabled: !formData.is_enabled })}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                formData.is_enabled ? "bg-green-500" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${
                  formData.is_enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm text-slate-600">
              {formData.is_enabled ? "Automation is active" : "Automation is inactive"}
            </span>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  const fetchAutomations = async () => {
    try {
      const response = await fetch("/api/admin/automations");
      if (response.ok) {
        const data = await response.json();
        setAutomations(data.automations || []);
      }
    } catch (error) {
      console.error("Failed to fetch automations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  const handleToggle = async (automation: Automation) => {
    try {
      const response = await fetch(`/api/admin/automations/${automation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_enabled: !automation.is_enabled }),
      });
      if (response.ok) {
        setAutomations(automations.map(a =>
          a.id === automation.id ? { ...a, is_enabled: !a.is_enabled } : a
        ));
      }
    } catch (error) {
      console.error("Failed to toggle automation:", error);
    }
  };

  const handleSave = async (data: Partial<Automation>) => {
    try {
      if (editingAutomation) {
        const response = await fetch(`/api/admin/automations/${editingAutomation.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Failed to update automation:", errorData);
          alert(`Failed to update automation: ${errorData.error || response.statusText}`);
          return;
        }
        await fetchAutomations();
      } else {
        const response = await fetch("/api/admin/automations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Failed to create automation:", errorData);
          alert(`Failed to create automation: ${errorData.error || response.statusText}`);
          return;
        }
        await fetchAutomations();
      }
      setEditingAutomation(null);
      setShowNewModal(false);
    } catch (error) {
      console.error("Failed to save automation:", error);
      alert("Failed to save automation. Please try again.");
    }
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-800">Message Automations</h1>
                <p className="text-sm text-slate-500">Automated DMs for member events</p>
              </div>
            </div>

            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Automation
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-6">

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-48 mb-2" />
              <div className="h-4 bg-slate-200 rounded w-32 mb-4" />
              <div className="h-3 bg-slate-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : automations.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500">No automations yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {automations.map((automation) => (
            <AutomationCard
              key={automation.id}
              automation={automation}
              onToggle={() => handleToggle(automation)}
              onEdit={() => setEditingAutomation(automation)}
            />
          ))}
        </div>
      )}

      {(editingAutomation || showNewModal) && (
        <EditModal
          automation={editingAutomation}
          onClose={() => {
            setEditingAutomation(null);
            setShowNewModal(false);
          }}
          onSave={handleSave}
        />
      )}
      </main>
    </>
  );
}
