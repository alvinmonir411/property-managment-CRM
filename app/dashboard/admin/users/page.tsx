"use client";

import React, { useState, useEffect } from "react";
import { Users, Shield, Trash2, Loader2, UserCog } from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const ManageUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        toast.success("User role updated successfully");
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    setActionLoading(userId);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("User deleted successfully");
        setUsers(users.filter((u) => u._id !== userId));
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: "bg-purple-50 text-purple-700 border-purple-200",
      agent: "bg-blue-50 text-blue-700 border-blue-200",
      user: "bg-slate-50 text-slate-700 border-slate-200",
    };
    return styles[role as keyof typeof styles] || styles["user"];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
          <p className="text-slate-500 text-sm">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-3xl p-8 shadow-2xl shadow-purple-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                User Management
              </h2>
              <p className="text-purple-100">
                Manage user roles and permissions
              </p>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-white">{users.length}</p>
                <p className="text-purple-100 text-sm">Total Users</p>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <p className="text-4xl font-bold text-white">
                  {users.filter((u) => u.role === "admin").length}
                </p>
                <p className="text-purple-100 text-sm">Admins</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Current Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Change Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-700">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold border inline-flex items-center gap-1",
                        getRoleBadge(user.role),
                      )}
                    >
                      {user.role === "admin" && <Shield className="w-3 h-3" />}
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user._id, e.target.value)
                      }
                      disabled={actionLoading === user._id}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50"
                    >
                      <option value="user">User</option>
                      <option value="agent">Agent</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      disabled={actionLoading === user._id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                      title="Delete User"
                    >
                      {actionLoading === user._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsersPage;
