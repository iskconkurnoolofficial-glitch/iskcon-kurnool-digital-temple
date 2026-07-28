import { useState } from "react";
import { useAdmin, TeamMember } from "@/context/AdminContext";
import { 
  Users, 
  ShieldCheck, 
  KeyRound, 
  UserPlus, 
  Trash2, 
  Pencil, 
  Eye, 
  EyeOff, 
  CheckSquare, 
  Square, 
  Lock, 
  X, 
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldAlert
} from "lucide-react";

// List of all customizable admin sections
export const ALL_ADMIN_SECTIONS = [
  { id: "previewLeads", label: "Preview Video & Leads", group: "Main Content" },
  { id: "featurePopup", label: "Feature Pop-Up", group: "Main Content" },
  { id: "carousel", label: "Carousel Banners", group: "Main Content" },
  { id: "heroBanners", label: "Hero Banners", group: "Main Content" },
  { id: "gallery", label: "Gallery Photos", group: "Main Content" },
  { id: "instagram", label: "Instagram Feed", group: "Main Content" },
  
  { id: "liveDashboard", label: "LIVE Dashboard", group: "Live Operations" },
  
  { id: "paymentPages", label: "Donations & Payment Records", group: "Devotional & Programs" },
  { id: "festivals", label: "Upcoming Festivals", group: "Devotional & Programs" },
  { id: "sevas", label: "Jagannath Sevas", group: "Devotional & Programs" },
  { id: "sunday", label: "Sunday Program", group: "Devotional & Programs" },
  { id: "classes", label: "Daily Classes", group: "Devotional & Programs" },
  { id: "templeSchedule", label: "Temple Schedule", group: "Devotional & Programs" },
  
  { id: "prahladaBadi", label: "Prahlada Badi", group: "Community Focus" },
  { id: "youth", label: "Youth Festival", group: "Community Focus" },
  { id: "gita", label: "Gita Course", group: "Community Focus" },
  { id: "harinama", label: "Harinama", group: "Community Focus" },
  { id: "ekadashi", label: "Ekadashi Vratam", group: "Community Focus" },
  { id: "goshala", label: "Goshala Seva", group: "Community Focus" },
  
  { id: "contacts", label: "Contact Messages", group: "Site Settings" },
  { id: "settings", label: "Site Settings", group: "Site Settings" },
];

export default function TeamManager() {
  const { teamMembers, addTeamMember, updateTeamMember, deleteTeamMember, changeSuperAdminPassword, currentUser } = useAdmin();

  // Superadmin Password change form state
  const [newSuperPass, setNewSuperPass] = useState("");
  const [confirmSuperPass, setConfirmSuperPass] = useState("");
  const [passSaved, setPassSaved] = useState(false);
  const [passErr, setPassErr] = useState("");

  // Modal / Drawer state for adding/editing team member
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberPassword, setMemberPassword] = useState("");
  const [selectedTabs, setSelectedTabs] = useState<string[]>([]);
  const [showMemberPass, setShowMemberPass] = useState(false);

  const [formErr, setFormErr] = useState("");

  // Superadmin Password Handler
  const handleChangeSuperPass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuperPass.trim()) {
      setPassErr("Please enter a valid password.");
      return;
    }
    if (newSuperPass !== confirmSuperPass) {
      setPassErr("Passwords do not match.");
      return;
    }
    await changeSuperAdminPassword(newSuperPass.trim());
    setPassSaved(true);
    setPassErr("");
    setNewSuperPass("");
    setConfirmSuperPass("");
    setTimeout(() => setPassSaved(false), 3000);
  };

  // Open Add Member Form
  const handleOpenAddModal = () => {
    setEditingMemberId(null);
    setMemberName("");
    setMemberEmail("");
    setMemberPassword("");
    setSelectedTabs(ALL_ADMIN_SECTIONS.map((s) => s.id)); // Default select all
    setFormErr("");
    setShowMemberModal(true);
  };

  // Open Edit Member Form
  const handleOpenEditModal = (member: TeamMember) => {
    setEditingMemberId(member.id);
    setMemberName(member.name);
    setMemberEmail(member.email);
    setMemberPassword(member.password);
    setSelectedTabs(member.allowedTabs || []);
    setFormErr("");
    setShowMemberModal(true);
  };

  // Save Team Member
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberEmail.trim() || !memberPassword.trim()) {
      setFormErr("Name, Email/Username, and Password are required.");
      return;
    }

    if (editingMemberId) {
      await updateTeamMember(editingMemberId, {
        name: memberName.trim(),
        email: memberEmail.trim(),
        password: memberPassword.trim(),
        allowedTabs: selectedTabs,
      });
    } else {
      await addTeamMember({
        name: memberName.trim(),
        email: memberEmail.trim(),
        password: memberPassword.trim(),
        role: "member",
        allowedTabs: selectedTabs,
      });
    }

    setShowMemberModal(false);
  };

  // Toggle Tab Access
  const toggleTabAccess = (tabId: string) => {
    if (selectedTabs.includes(tabId)) {
      setSelectedTabs(selectedTabs.filter((id) => id !== tabId));
    } else {
      setSelectedTabs([...selectedTabs, tabId]);
    }
  };

  const handleSelectAll = () => {
    setSelectedTabs(ALL_ADMIN_SECTIONS.map((s) => s.id));
  };

  const handleDeselectAll = () => {
    setSelectedTabs([]);
  };

  const isSuperAdmin = currentUser?.role === "superadmin";

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      {/* 1. HEADER BANNER */}
      <div className="bg-gradient-to-r from-primary via-[#4a2282] to-primary rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-amber-200 backdrop-blur-md mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Role-Based Access Control</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Team &amp; Access Control</h1>
            <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl">
              Superadmin can add team members, customize section permissions for each member, and update login passwords.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-white/70 block">Team Members</span>
              <span className="text-xl font-extrabold text-amber-300">{teamMembers.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* NON-SUPERADMIN NOTICE */}
      {!isSuperAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-3 text-amber-900 text-sm">
          <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0" />
          <p className="font-semibold">
            Only Superadmin can add or modify team members and change master security passwords.
          </p>
        </div>
      )}

      {/* 2. SUPERADMIN MASTER PASSWORD CARD */}
      {isSuperAdmin && (
        <div className="bg-white rounded-3xl p-6 border shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <KeyRound className="h-5 w-5 text-amber-500" />
            <h3 className="font-display text-lg font-bold text-primary">Change Superadmin Master Password</h3>
          </div>

          <form onSubmit={handleChangeSuperPass} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                New Master Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newSuperPass}
                onChange={(e) => setNewSuperPass(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmSuperPass}
                onChange={(e) => setConfirmSuperPass(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Lock className="h-4 w-4" /> Update Master Password
              </button>
            </div>
          </form>

          {passErr && (
            <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" /> {passErr}
            </p>
          )}

          {passSaved && (
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Superadmin password updated successfully!
            </p>
          )}
        </div>
      )}

      {/* 3. TEAM MEMBERS DIRECTORY */}
      <div className="bg-white rounded-3xl p-6 border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h3 className="font-display text-lg font-bold text-primary">Team Members &amp; Section Access</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Team members can sign in with their email/username and password to access their permitted sections.
            </p>
          </div>

          {isSuperAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <UserPlus className="h-4 w-4" /> Add New Team Member
            </button>
          )}
        </div>

        {teamMembers.length === 0 ? (
          <div className="p-12 text-center border border-dashed rounded-2xl space-y-2">
            <Users className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="font-bold text-xs text-slate-600">No Team Members Added</p>
            <p className="text-[11px] text-slate-400">
              Superadmin can add team members and give them access to specific admin panel sections.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Member Name</th>
                  <th className="py-3.5 px-4">Email / Username</th>
                  <th className="py-3.5 px-4">Password</th>
                  <th className="py-3.5 px-4">Permitted Sections</th>
                  {isSuperAdmin && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{member.name}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{member.email}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 font-medium">••••••••</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[11px]">
                        {member.allowedTabs?.length || 0} / {ALL_ADMIN_SECTIONS.length} Sections
                      </span>
                    </td>
                    {isSuperAdmin && (
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(member)}
                          className="px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          Edit Access
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${member.name} from team access?`)) {
                              deleteTeamMember(member.id);
                            }
                          }}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          Remove
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. ADD / EDIT TEAM MEMBER MODAL */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2.5">
                <UserPlus className="h-5 w-5 text-primary" />
                <h3 className="font-display text-xl font-bold text-primary">
                  {editingMemberId ? "Edit Team Member Access" : "Add New Team Member"}
                </h3>
              </div>
              <button
                onClick={() => setShowMemberModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Member Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Radharani Devi"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    className="w-full px-3.5 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Email / Username
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. radharani@iskcon.org"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    className="w-full px-3.5 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Login Password
                  </label>
                  <div className="relative">
                    <input
                      type={showMemberPass ? "text" : "password"}
                      placeholder="Assign password"
                      value={memberPassword}
                      onChange={(e) => setMemberPassword(e.target.value)}
                      className="w-full pl-3.5 pr-8 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMemberPass(!showMemberPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showMemberPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Section Access Checkboxes */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Permitted Admin Sections ({selectedTabs.length} Selected)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-[11px] text-primary font-bold hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="text-[11px] text-slate-500 font-bold hover:underline cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-3 border rounded-2xl bg-slate-50/50">
                  {ALL_ADMIN_SECTIONS.map((sec) => {
                    const isChecked = selectedTabs.includes(sec.id);
                    return (
                      <div
                        key={sec.id}
                        onClick={() => toggleTabAccess(sec.id)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition select-none ${
                          isChecked
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <span className="truncate">{sec.label}</span>
                        {isChecked ? (
                          <CheckSquare className="h-4 w-4 text-primary shrink-0 ml-2" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-300 shrink-0 ml-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {formErr && (
                <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {formErr}
                </p>
              )}

              <div className="flex gap-3 pt-3 border-t justify-end">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  {editingMemberId ? "Update Access Permissions" : "Create Team Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
