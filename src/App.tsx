import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { 
  LayoutDashboard, 
  BookOpen, 
  ClipboardList, 
  PlusCircle, 
  Trash2, 
  ChevronRight, 
  Clock, 
  User as UserIcon, 
  LogOut,
  CheckCircle2,
  XCircle,
  Award,
  ArrowLeft,
  Users as UsersIcon,
  Settings,
  FileSpreadsheet,
  Key,
  Search,
  Check,
  Database,
  Image as ImageIcon,
  Edit2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Test, Question, Result, User, QuestionBank, BankQuestion } from './types';

const DEPARTMENTS = [
  'CSE',
  'AI & DS',
  'IT',
  'EEE',
  'ECE',
  'Mech'
];

// --- Components ---

const Navbar = ({ user, onLogout, onChangePassword }: { user: User | null, onLogout: () => void, onChangePassword: () => void }) => (
  <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <BookOpen className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-zinc-900 tracking-tight">QuizMaster Pro</span>
        </div>
        
        {user && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={onChangePassword}
                className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-zinc-50"
                title="Change Password"
              >
                <Key className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-600">
                  <UserIcon className="w-4 h-4" />
                  <span>{user.role === 'admin' ? user.username : (user.student_id ? `${user.username} (${user.student_id})` : user.username)}</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                  {user.role === 'admin' ? 'Administrator' : `Batch: ${user.batch}`}
                </span>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  </nav>
);

// --- Views ---

const LoginView = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-zinc-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-zinc-200 p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-900">QuizMaster Pro</h1>
          <p className="text-zinc-500 mt-2">Sign in to access your dashboard</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2"
          >
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Username / Student ID</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="Admin: Username | Student: ID"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="Enter your password"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const UsersManagement = ({ onUpdate }: { onUpdate?: () => void }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newUser, setNewUser] = useState({ username: '', password: '', batch: '', student_id: '', department: DEPARTMENTS[0] });
  const [addError, setAddError] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showClearGridConfirm, setShowClearGridConfirm] = useState(false);
  const [showSkipMissingConfirm, setShowSkipMissingConfirm] = useState(false);
  const [isBulkView, setIsBulkView] = useState(false);
  const [bulkData, setBulkData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        setSelectedUserIds([]); // Reset selection on fetch
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    if (res.ok) {
      setIsAdding(false);
      setNewUser({ username: '', password: '', batch: '', student_id: '', department: DEPARTMENTS[0] });
      fetchUsers();
      onUpdate?.();
    } else {
      const data = await res.json();
      setAddError(data.error || 'Failed to add user');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    
    setIsBulkDeleting(true);
    try {
      const res = await fetch('/api/users/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedUserIds })
      });
      if (res.ok) {
        await fetchUsers();
        onUpdate?.();
        setShowBulkDeleteConfirm(false);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete users');
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('Error deleting users. Please try again.');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/users/${userToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchUsers();
        onUpdate?.();
        setUserToDelete(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete student');
      }
    } catch (error) {
      console.error('Delete student error:', error);
      alert('Error deleting student. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleUserSelection = (id: string) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(u => u.id));
    }
  };

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(query) ||
      (user.student_id || '').toLowerCase().includes(query) ||
      (user.batch || '').toLowerCase().includes(query) ||
      (user.department || '').toLowerCase().includes(query)
    );
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isChangingPassword) return;

    const res = await fetch('/api/users/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: isChangingPassword, newPassword })
    });

    if (res.ok) {
      setIsChangingPassword(null);
      setNewPassword('');
      alert('Password updated successfully');
    } else {
      alert('Failed to update password');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      const formattedUsers = data.map((row: any) => {
        const sid = row.student_id || row.StudentID || row.RegisterNumber || row['Register Number'] || '';
        const dept = row.department || row.Department || '';
        return {
          username: String(row.username || row.Username || '').trim(),
          password: String(row.password || row.Password || '').trim(),
          batch: String(row.batch || row.Batch || '').trim(),
          student_id: String(sid).trim(),
          department: String(dept).trim() || DEPARTMENTS[0]
        };
      }).filter(u => u.username || u.password || u.batch);

      setBulkData([...bulkData, ...formattedUsers]);
      setIsBulkView(true);
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFinalizeBulk = async () => {
    const processedUsers = bulkData.map(u => ({
      username: String(u.username || '').trim(),
      password: String(u.password || '').trim(),
      batch: String(u.batch || '').trim(),
      student_id: String(u.student_id || '').trim(),
      department: String(u.department || DEPARTMENTS[0]).trim()
    }));

    const validUsers = processedUsers.filter(u => u.username && u.password && u.batch);
    
    console.log('Finalizing bulk upload. Valid users:', validUsers.length, 'Total rows:', processedUsers.length);

    if (validUsers.length === 0) {
      alert('No valid users to upload. Please ensure Username, Password, and Batch are filled for at least one row.');
      return;
    }

    if (validUsers.length < processedUsers.filter(u => u.username || u.password || u.batch || u.student_id).length) {
      setShowSkipMissingConfirm(true);
      return;
    }

    proceedWithBulkUpload(validUsers);
  };

  const proceedWithBulkUpload = async (validUsers: any[]) => {
    setIsUploading(true);
    try {
      console.log('Sending bulk upload request...');
      const res = await fetch('/api/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: validUsers })
      });
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        console.log('Bulk upload response:', data);

        if (res.ok) {
          alert(`Successfully uploaded ${validUsers.length} students`);
          setIsBulkView(false);
          setBulkData([]);
          fetchUsers();
          onUpdate?.();
        } else {
          alert(data.error || data.message || 'Failed to bulk upload users');
        }
      } else {
        const text = await res.text();
        console.error('Non-JSON response received:', text);
        alert(`Server error: Received non-JSON response. Status: ${res.status}`);
      }
    } catch (error) {
      console.error('Bulk upload fetch error:', error);
      alert('Error uploading data. Please check your connection and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const addBulkRow = () => {
    setBulkData([...bulkData, { username: '', password: '', batch: '', student_id: '', department: DEPARTMENTS[0] }]);
  };

  const updateBulkRow = (index: number, field: string, value: string) => {
    const newData = [...bulkData];
    newData[index] = { ...newData[index], [field]: value };
    setBulkData(newData);
  };

  const removeBulkRow = (index: number) => {
    setBulkData(bulkData.filter((_, i) => i !== index));
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Register Number': '2022CS001',
        'Username': 'student_name',
        'Password': 'password123',
        'Batch': '2026 Passed Out',
        'Department': 'Computer Science'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    XLSX.writeFile(wb, "Student_Upload_Template.xlsx");
  };

  if (isBulkView) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <button 
              onClick={() => setIsBulkView(false)}
              className="text-sm text-zinc-500 hover:text-indigo-600 flex items-center gap-1 mb-1 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Students
            </button>
            <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
              Bulk Data Entry
              <span className="ml-2 text-sm font-normal text-zinc-400">({bulkData.length} rows)</span>
            </h2>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={downloadTemplate}
              className="flex items-center gap-2 bg-white text-zinc-700 border border-zinc-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-zinc-400" />
              Download Template
            </button>
            <button 
              type="button"
              onClick={addBulkRow}
              className="flex items-center gap-2 bg-zinc-100 text-zinc-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Add Row
            </button>
            <button 
              type="button"
              onClick={() => setShowClearGridConfirm(true)}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
            <button 
              type="button"
              onClick={handleFinalizeBulk}
              disabled={isUploading}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Finalize & Upload
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider w-12">#</th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Student ID / Reg No</th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Username *</th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Password *</th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Batch *</th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Department *</th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {bulkData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-4 py-2 text-zinc-400 font-mono text-xs">{idx + 1}</td>
                    <td className="px-2 py-1">
                      <input 
                        type="text" 
                        value={row.student_id}
                        onChange={(e) => updateBulkRow(idx, 'student_id', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-md border border-transparent focus:border-indigo-300 focus:bg-white bg-transparent outline-none transition-all text-sm"
                        placeholder="e.g. 2022CS001"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input 
                        type="text" 
                        value={row.username}
                        onChange={(e) => updateBulkRow(idx, 'username', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-md border border-transparent focus:border-indigo-300 focus:bg-white bg-transparent outline-none transition-all text-sm font-medium"
                        placeholder="Username"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input 
                        type="text" 
                        value={row.password}
                        onChange={(e) => updateBulkRow(idx, 'password', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-md border border-transparent focus:border-indigo-300 focus:bg-white bg-transparent outline-none transition-all text-sm"
                        placeholder="Password"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input 
                        type="text" 
                        value={row.batch}
                        onChange={(e) => updateBulkRow(idx, 'batch', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-md border border-transparent focus:border-indigo-300 focus:bg-white bg-transparent outline-none transition-all text-sm"
                        placeholder="e.g. 2026 passed out"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <select 
                        value={row.department}
                        onChange={(e) => updateBulkRow(idx, 'department', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-md border border-transparent focus:border-indigo-300 focus:bg-white bg-transparent outline-none transition-all text-sm"
                      >
                        {DEPARTMENTS.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button 
                        type="button"
                        onClick={() => removeBulkRow(idx)}
                        className="text-zinc-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {bulkData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center">
                          <PlusCircle className="w-6 h-6 text-zinc-300" />
                        </div>
                        <p className="text-zinc-400 text-sm">No data entries yet. Add a row or import an Excel file.</p>
                        <button 
                          onClick={addBulkRow}
                          className="text-indigo-600 text-sm font-semibold hover:underline"
                        >
                          Add your first row
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-zinc-50 px-6 py-3 border-t border-zinc-200 flex justify-between items-center">
            <p className="text-xs text-zinc-500 italic">* Required fields: Username, Password, Batch</p>
            <div className="flex items-center gap-4">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx, .xls"
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Import from Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-zinc-800 flex items-center gap-2">
          <UsersIcon className="w-5 h-5 text-indigo-600" />
          Student Management
        </h2>
        <div className="flex gap-3">
          <button 
            onClick={downloadTemplate}
            className="flex items-center gap-2 bg-white text-zinc-700 border border-zinc-200 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-zinc-400" />
            Template
          </button>
          <button 
            onClick={() => {
              setBulkData([{ username: '', password: '', batch: '', student_id: '' }]);
              setIsBulkView(true);
            }}
            className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Bulk Upload
          </button>
          <button 
            onClick={() => {
              setAddError(null);
              setIsAdding(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text"
            placeholder="Search by name, ID, or batch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        
        {selectedUserIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-red-50 border border-red-100 px-4 py-2 rounded-xl"
          >
            <span className="text-sm font-medium text-red-700">
              {selectedUserIds.length} users selected
            </span>
            <button 
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-700 transition-all shadow-sm flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Delete Selected
            </button>
          </motion.div>
        )}
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
            <tr>
              <th className="px-6 py-3 w-10">
                <input 
                  type="checkbox"
                  checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="px-6 py-3">Student ID</th>
              <th className="px-6 py-3">Username</th>
              <th className="px-6 py-3">Batch</th>
              <th className="px-6 py-3">Department</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredUsers.map(user => (
              <tr key={user.id} className={cn(
                "hover:bg-zinc-50 transition-colors",
                selectedUserIds.includes(user.id) && "bg-indigo-50/30"
              )}>
                <td className="px-6 py-4">
                  <input 
                    type="checkbox"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-6 py-4 font-mono text-zinc-500">{user.student_id || 'N/A'}</td>
                <td className="px-6 py-4 font-medium text-zinc-900">{user.username}</td>
                <td className="px-6 py-4 text-zinc-500">{user.batch}</td>
                <td className="px-6 py-4 text-zinc-500">{user.department || 'N/A'}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setIsChangingPassword(user.id)}
                      className="text-zinc-400 hover:text-indigo-600 transition-colors"
                      title="Change Password"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setUserToDelete(user);
                      }}
                      className="p-2 text-zinc-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-zinc-400">
                  {searchQuery ? 'No students match your search.' : 'No students found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">Add New Student</h2>
              
              {addError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  {addError}
                </div>
              )}

              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Student ID / Reg No</label>
                  <input 
                    type="text" 
                    value={newUser.student_id}
                    onChange={e => setNewUser({...newUser, student_id: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. 2022CS001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Username</label>
                  <input 
                    type="text" 
                    required
                    value={newUser.username}
                    onChange={e => setNewUser({...newUser, username: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. student01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
                  <input 
                    type="password" 
                    required
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Batch</label>
                  <input 
                    type="text" 
                    required
                    value={newUser.batch}
                    onChange={e => setNewUser({...newUser, batch: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. 2026 passed out"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Department</label>
                  <select 
                    required
                    value={newUser.department}
                    onChange={e => setNewUser({...newUser, department: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setAddError(null);
                    }}
                    className="flex-1 px-4 py-2.5 rounded-lg font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Add Student
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isChangingPassword && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">New Password</label>
                  <input 
                    type="password" 
                    required
                    autoFocus
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Enter new password"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(null);
                      setNewPassword('');
                    }}
                    className="flex-1 px-4 py-2.5 rounded-lg font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showClearGridConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">Clear Grid?</h2>
              <p className="text-zinc-600 mb-6 leading-relaxed">
                Are you sure you want to clear all entries in the grid? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowClearGridConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setBulkData([]);
                    setShowClearGridConfirm(false);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSkipMissingConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">Missing Fields Detected</h2>
              <p className="text-zinc-600 mb-6 leading-relaxed">
                Some rows are missing required fields (Username, Password, Batch) and will be skipped. Proceed with the valid students?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowSkipMissingConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowSkipMissingConfirm(false);
                    const processedUsers = bulkData.map(u => ({
                      username: String(u.username || '').trim(),
                      password: String(u.password || '').trim(),
                      batch: String(u.batch || '').trim(),
                      student_id: String(u.student_id || '').trim(),
                      department: String(u.department || DEPARTMENTS[0]).trim()
                    }));
                    const validUsers = processedUsers.filter((u: any) => u.username && u.password && u.batch);
                    proceedWithBulkUpload(validUsers);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-sm"
                >
                  Proceed
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBulkDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-zinc-200"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900">Bulk Delete Students?</h3>
                  <p className="text-zinc-500 text-sm">This action cannot be undone.</p>
                </div>
              </div>
              
              <div className="bg-zinc-50 rounded-xl p-4 mb-6 border border-zinc-100">
                <p className="text-sm text-zinc-600">
                  Are you sure you want to delete <span className="font-bold text-zinc-900">{selectedUserIds.length}</span> selected users? 
                  All their test results and data will be permanently removed.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 font-semibold hover:bg-zinc-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all shadow-md shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isBulkDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete All Selected'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-zinc-200"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900">Delete Student?</h3>
                  <p className="text-zinc-500 text-sm">This action cannot be undone.</p>
                </div>
              </div>
              
              <div className="bg-zinc-50 rounded-xl p-4 mb-6 border border-zinc-100">
                <p className="text-sm text-zinc-600">
                  Are you sure you want to delete the user: <span className="font-bold text-zinc-900">{userToDelete.username}</span>? 
                  All their test results and data will be permanently removed.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 font-semibold hover:bg-zinc-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all shadow-md shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete User'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const QuestionBanksManagement = () => {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [newBankTitle, setNewBankTitle] = useState('');
  const [bankToDelete, setBankToDelete] = useState<QuestionBank | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const res = await fetch('/api/question-banks');
      const data = await res.json();
      setBanks(data);
    } catch (error) {
      console.error('Failed to fetch question banks:', error);
    }
  };

  const handleCreateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingBankId 
        ? `/api/question-banks/${editingBankId}` 
        : '/api/question-banks';
      const method = editingBankId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newBankTitle })
      });
      if (res.ok) {
        setIsCreating(false);
        setEditingBankId(null);
        setNewBankTitle('');
        fetchBanks();
      }
    } catch (error) {
      console.error('Failed to save question bank:', error);
    }
  };

  const handleDeleteBank = async () => {
    if (!bankToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/question-banks/${bankToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBanks();
        setBankToDelete(null);
      }
    } catch (error) {
      console.error('Failed to delete question bank:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-zinc-800 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          Question Banks
        </h2>
        <button 
          onClick={() => {
            setIsCreating(true);
            setEditingBankId(null);
            setNewBankTitle('');
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Create Bank
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {banks.map(bank => (
          <div 
            key={bank.id}
            className="bg-white border border-zinc-200 rounded-xl p-5 hover:shadow-md transition-all group cursor-pointer"
            onClick={() => navigate(`/admin/banks/${bank.id}`)}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-zinc-900 text-lg">{bank.title}</h3>
              <div className="flex gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingBankId(bank.id);
                    setNewBankTitle(bank.title);
                    setIsCreating(true);
                  }}
                  className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Edit Bank"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setBankToDelete(bank);
                  }}
                  className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Bank"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-xs text-zinc-500">
              Created: {new Date(bank.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
        {banks.length === 0 && (
          <div className="col-span-full p-8 text-center text-zinc-400 bg-white border border-zinc-200 rounded-xl border-dashed">
            No question banks yet. Create one to start managing reusable questions.
          </div>
        )}
      </div>

      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">
                {editingBankId ? 'Edit Question Bank' : 'Create Question Bank'}
              </h2>
              <form onSubmit={handleCreateBank} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Bank Title</label>
                  <input 
                    type="text" 
                    required
                    value={newBankTitle}
                    onChange={e => setNewBankTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Speed, Time & Distance"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    {editingBankId ? 'Save Changes' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {bankToDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-6">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">Delete Question Bank?</h2>
              <p className="text-zinc-600 mb-6">
                Are you sure you want to delete "{bankToDelete.title}"? This will permanently delete all questions inside this bank. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setBankToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium text-zinc-600 hover:bg-zinc-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteBank}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm flex justify-center items-center"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Bank'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminDashboard = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'tests' | 'users' | 'banks' | 'results'>('tests');
  const [testToDelete, setTestToDelete] = useState<Test | null>(null);
  const [resultToDelete, setResultToDelete] = useState<Result | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newTest, setNewTest] = useState({ title: '', description: '', duration: 30, target_batch: 'All', negative_marks: false });
  const [isDeletingResult, setIsDeletingResult] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
    fetchResults();
    fetchBatches();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/tests');
      if (res.ok) {
        const data = await res.json();
        setTests(data);
      }
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    }
  };

  const fetchResults = async () => {
    try {
      const res = await fetch('/api/results');
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Failed to fetch results:', error);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await fetch('/api/batches');
      if (res.ok) {
        const data = await res.json();
        setBatches(data);
      }
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    }
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTest.title,
        description: newTest.description,
        duration_minutes: newTest.duration,
        target_batch: newTest.target_batch,
        negative_marks: newTest.negative_marks
      })
    });
    const data = await res.json();
    setIsCreating(false);
    setNewTest({ title: '', description: '', duration: 30, target_batch: 'All', negative_marks: false });
    fetchTests();
    navigate(`/admin/test/${data.id}`);
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/tests/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !currentStatus })
      });
      if (res.ok) {
        fetchTests();
      }
    } catch (error) {
      console.error('Publish error:', error);
    }
  };

  const handleDeleteTest = async () => {
    if (!testToDelete) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/tests/${testToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTests();
        setTestToDelete(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete test');
      }
    } catch (error) {
      console.error('Delete test error:', error);
      alert('Error deleting test. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Admin Dashboard</h1>
          <p className="text-zinc-500">Manage your college MCQ tests and view student performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-sm"
          >
            <PlusCircle className="w-5 h-5" />
            Create New Test
          </button>
          <div className="h-8 w-px bg-zinc-200 mx-1 hidden md:block" />
          <div className="flex p-1 bg-zinc-100 rounded-xl">
            <button 
              onClick={() => setActiveTab('tests')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                activeTab === 'tests' ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              Tests
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                activeTab === 'users' ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              Students
            </button>
            <button 
              onClick={() => setActiveTab('banks')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                activeTab === 'banks' ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              Question Banks
            </button>
            <button 
              onClick={() => setActiveTab('results')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                activeTab === 'results' ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              All Results
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'users' ? (
        <UsersManagement onUpdate={fetchBatches} />
      ) : activeTab === 'banks' ? (
        <QuestionBanksManagement />
      ) : activeTab === 'results' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-zinc-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              Comprehensive Results Management
            </h2>
            <button 
              onClick={fetchResults}
              className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
          
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Student Name</th>
                  <th className="px-6 py-3">Student ID</th>
                  <th className="px-6 py-3">Test Title</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3">Completed At</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {results.map(result => (
                  <tr key={result.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900">{result.student_name}</td>
                    <td className="px-6 py-4 font-mono text-zinc-500">{result.student_id}</td>
                    <td className="px-6 py-4 text-zinc-600">{result.test_title}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "font-bold px-2 py-1 rounded-lg text-xs",
                        (result.score / result.total_questions) >= 0.5 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                      )}>
                        {result.score} / {result.total_questions}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-xs">
                      {new Date(result.completed_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setResultToDelete(result)}
                        disabled={isDeletingResult === result.id}
                        className="text-red-600 hover:text-red-700 font-semibold text-xs flex items-center gap-1 justify-end disabled:opacity-50"
                      >
                        <RefreshCw className={cn("w-3 h-3", isDeletingResult === result.id && "animate-spin")} />
                        Allow Redo
                      </button>
                    </td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                      No test results found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold text-zinc-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-indigo-600" />
              Active Tests
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tests.map(test => (
                <div 
                  key={test.id}
                  className="bg-white border border-zinc-200 rounded-xl p-5 hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-zinc-900 text-lg">{test.title}</h3>
                        <div className="flex gap-1.5">
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider",
                            test.is_published ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          )}>
                            {test.is_published ? 'Published' : 'Draft'}
                          </span>
                          {test.negative_marks === 1 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-red-100 text-red-700">
                              Negative
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">Target: {test.target_batch}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        type="button"
                        onClick={() => handleTogglePublish(test.id, !!test.is_published)}
                        className={cn(
                          "text-xs font-bold px-3 py-1 rounded-lg transition-all",
                          test.is_published 
                            ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200" 
                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                        )}
                      >
                        {test.is_published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setTestToDelete(test);
                        }}
                        className="relative z-10 p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Test"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-zinc-500 text-sm line-clamp-2 mb-4">{test.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{test.duration_minutes} mins</span>
                    </div>
                    <Link 
                      to={`/admin/test/${test.id}`}
                      className="text-indigo-600 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Manage Questions <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
              {tests.length === 0 && (
                <div className="col-span-full py-12 text-center bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl">
                  <p className="text-zinc-400">No tests created yet. Start by creating one!</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-zinc-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              Recent Results
            </h2>
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
              <div className="divide-y divide-zinc-100">
                {results.slice(0, 5).map(result => (
                  <div key={result.id} className="p-4 hover:bg-zinc-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-zinc-900">{result.student_name}</span>
                      <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-full",
                        (result.score / result.total_questions) >= 0.5 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      )}>
                        {result.score}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500 flex justify-between">
                      <span>{result.test_title}</span>
                      <span>{new Date(result.completed_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {results.length === 0 && (
                  <div className="p-8 text-center text-zinc-400 text-sm">
                    No results yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div 
              key="create-test-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">Create New Test</h2>
              <form onSubmit={handleCreateTest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Test Title</label>
                  <input 
                    type="text" 
                    required
                    value={newTest.title}
                    onChange={e => setNewTest({...newTest, title: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Data Structures Mid-term"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
                  <textarea 
                    required
                    value={newTest.description}
                    onChange={e => setNewTest({...newTest, description: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                    placeholder="Briefly describe what this test covers..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Duration (mins)</label>
                    <input 
                      type="number" 
                      required
                      value={newTest.duration}
                      onChange={e => setNewTest({...newTest, duration: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Target Batch</label>
                    <select 
                      required
                      value={newTest.target_batch}
                      onChange={e => setNewTest({...newTest, target_batch: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      <option value="All">All Batches</option>
                      {Array.isArray(batches) && batches.map(batch => (
                        <option key={batch} value={batch}>{batch}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newTest.negative_marks}
                      onChange={e => setNewTest({...newTest, negative_marks: e.target.checked})}
                      className="w-4 h-4 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-500"
                    />
                    Enable Negative Marking (-1 per wrong answer)
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Create Test
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {resultToDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">Allow Redo</h2>
              <p className="text-zinc-600 mb-6 leading-relaxed">
                Are you sure you want to allow <strong>{resultToDelete.student_name}</strong> to redo <strong>{resultToDelete.test_title}</strong>? This will permanently delete their current result.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setResultToDelete(null)}
                  disabled={isDeletingResult === resultToDelete.id}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium text-zinc-600 hover:bg-zinc-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    setIsDeletingResult(resultToDelete.id);
                    try {
                      const res = await fetch(`/api/results/${resultToDelete.id}`, { method: 'DELETE' });
                      if (res.ok) {
                        fetchResults();
                        setResultToDelete(null);
                      }
                    } catch (error) {
                      console.error('Failed to delete result:', error);
                    } finally {
                      setIsDeletingResult(null);
                    }
                  }}
                  disabled={isDeletingResult === resultToDelete.id}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm flex justify-center items-center disabled:opacity-50"
                >
                  {isDeletingResult === resultToDelete.id ? 'Processing...' : 'Confirm Redo'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {testToDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-zinc-200"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900">Delete Test?</h3>
                  <p className="text-zinc-500 text-sm">This action cannot be undone.</p>
                </div>
              </div>
              
              <div className="bg-zinc-50 rounded-xl p-4 mb-6 border border-zinc-100">
                <p className="text-sm text-zinc-600">
                  Are you sure you want to delete the test: <span className="font-bold text-zinc-900">{testToDelete.title}</span>? 
                  All questions and results for this test will be permanently removed.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setTestToDelete(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 font-semibold hover:bg-zinc-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTest}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all shadow-md shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Test'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TestManagement = () => {
  const { id } = useParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [generateCount, setGenerateCount] = useState<number>(10);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'questions' | 'leaderboard'>('questions');
  const [results, setResults] = useState<Result[]>([]);
  const [newQ, setNewQ] = useState({
    text: '',
    options: ['', '', '', ''],
    correct: 0,
    image_url: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
    fetchBanks();
    fetchTestResults();
  }, [id]);

  const fetchQuestions = async () => {
    const res = await fetch(`/api/tests/${id}/questions`);
    const data = await res.json();
    setQuestions(data);
  };

  const fetchBanks = async () => {
    const res = await fetch('/api/question-banks');
    const data = await res.json();
    setBanks(data);
  };

  const fetchTestResults = async () => {
    const res = await fetch(`/api/tests/${id}/results`);
    const data = await res.json();
    setResults(data);
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(results.map((r, i) => ({
      Rank: i + 1,
      'Student Name': r.student_name,
      'Student ID': r.student_id,
      Score: r.score,
      'Total Questions': r.total_questions,
      'Percentage': `${Math.round((r.score / r.total_questions) * 100)}%`,
      'Completed At': new Date(r.completed_at).toLocaleString()
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leaderboard");
    XLSX.writeFile(wb, `leaderboard_test_${id}.xlsx`);
  };

  const handleGenerateQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBanks.length === 0) {
      alert("Please select at least one question bank.");
      return;
    }
    
    try {
      const res = await fetch(`/api/tests/${id}/generate-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bank_ids: selectedBanks,
          total_questions: generateCount
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setIsGenerating(false);
        setSelectedBanks([]);
        setGenerateCount(10);
        fetchQuestions();
        alert(`Successfully added ${data.addedCount} questions.`);
      } else {
        alert(data.error || "Failed to generate questions");
      }
    } catch (error) {
      console.error("Generate error:", error);
      alert("Error generating questions.");
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingQuestionId 
        ? `/api/questions/${editingQuestionId}`
        : `/api/tests/${id}/questions`;
        
      const method = editingQuestionId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_text: newQ.text,
          correct_option_index: newQ.correct,
          options: newQ.options,
          image_url: newQ.image_url
        })
      });
      
      if (res.ok) {
        setIsAdding(false);
        setNewQ({ text: '', options: ['', '', '', ''], correct: 0, image_url: '' });
        setEditingQuestionId(null);
        fetchQuestions();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save question");
      }
    } catch (error) {
      console.error("Save question error:", error);
      alert("Error saving question. The image might be too large.");
    }
  };

  const handleEditQuestion = (q: Question) => {
    setNewQ({
      text: q.question_text,
      options: q.options.map(o => o.option_text),
      correct: q.correct_option_index,
      image_url: q.image_url || ''
    });
    setEditingQuestionId(q.id);
    setIsAdding(true);
  };

  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/questions/${questionToDelete.id}`, { method: 'DELETE' });
      fetchQuestions();
      setQuestionToDelete(null);
    } catch (error) {
      console.error('Failed to delete question:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/admin')}
        className="flex items-center gap-2 text-zinc-500 hover:text-indigo-600 transition-colors mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Test Management</h1>
          <div className="flex gap-2 mt-4">
            <button 
              onClick={() => setActiveTab('questions')}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-all text-sm",
                activeTab === 'questions' ? "bg-indigo-600 text-white shadow-sm" : "bg-white text-zinc-600 hover:bg-zinc-50 border border-zinc-200"
              )}
            >
              Questions
            </button>
            <button 
              onClick={() => setActiveTab('leaderboard')}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-all text-sm",
                activeTab === 'leaderboard' ? "bg-indigo-600 text-white shadow-sm" : "bg-white text-zinc-600 hover:bg-zinc-50 border border-zinc-200"
              )}
            >
              Leaderboard
            </button>
          </div>
        </div>
        
        {activeTab === 'questions' && (
          <div className="flex gap-3">
            <button 
              onClick={() => setIsGenerating(true)}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-all shadow-sm"
            >
              <Database className="w-5 h-5" />
              Generate from Banks
            </button>
            <button 
              onClick={() => {
                setIsAdding(true);
                setEditingQuestionId(null);
                setNewQ({ text: '', options: ['', '', '', ''], correct: 0, image_url: '' });
              }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-sm"
            >
              <PlusCircle className="w-5 h-5" />
              Add Question
            </button>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-5 h-5" />
            Export to Excel
          </button>
        )}
      </div>

      {activeTab === 'questions' ? (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white border border-zinc-200 rounded-xl p-6 relative group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Question {idx + 1}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditQuestion(q)}
                    className="text-zinc-400 hover:text-indigo-600 transition-colors"
                    title="Edit Question"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setQuestionToDelete(q)}
                    className="text-zinc-400 hover:text-red-600 transition-colors"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-zinc-900 font-medium text-lg mb-6">{q.question_text}</p>
              {q.image_url && (
                <div className="mb-6">
                  <img src={q.image_url} alt="Reference" className="max-w-full h-auto rounded-lg shadow-sm border border-zinc-200 max-h-48 object-contain" />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((opt, oIdx) => (
                  <div 
                    key={opt.id}
                    className={cn(
                      "p-3 rounded-lg border text-sm flex items-center justify-between",
                      oIdx === q.correct_option_index 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-medium" 
                        : "bg-zinc-50 border-zinc-100 text-zinc-600"
                    )}
                  >
                    <span>{opt.option_text}</span>
                    {oIdx === q.correct_option_index && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {questions.length === 0 && (
            <div className="py-20 text-center bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl">
              <p className="text-zinc-400">No questions added yet. Click "Add Question" to begin.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-zinc-900">Rank</th>
                  <th className="px-6 py-4 font-semibold text-zinc-900">Student Name</th>
                  <th className="px-6 py-4 font-semibold text-zinc-900">Student ID</th>
                  <th className="px-6 py-4 font-semibold text-zinc-900">Score</th>
                  <th className="px-6 py-4 font-semibold text-zinc-900">Percentage</th>
                  <th className="px-6 py-4 font-semibold text-zinc-900">Completed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {results.map((result, index) => (
                  <tr key={result.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                        index === 0 ? "bg-yellow-100 text-yellow-700" :
                        index === 1 ? "bg-zinc-100 text-zinc-700" :
                        index === 2 ? "bg-orange-100 text-orange-700" :
                        "text-zinc-500"
                      )}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-900 font-medium">{result.student_name}</td>
                    <td className="px-6 py-4 text-zinc-500 font-mono">{result.student_id}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-bold",
                        (result.score / result.total_questions) >= 0.5 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      )}>
                        {result.score}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 font-medium">
                      {Math.round((result.score / result.total_questions) * 100)}%
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {new Date(result.completed_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                      No results available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {questionToDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-6">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">Delete Question?</h2>
              <p className="text-zinc-600 mb-6">
                Are you sure you want to delete this question? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setQuestionToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium text-zinc-600 hover:bg-zinc-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteQuestion}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isGenerating && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">Generate from Banks</h2>
              <form onSubmit={handleGenerateQuestions} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Select Question Banks</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-zinc-200 rounded-lg p-3">
                    {banks.map(bank => (
                      <label key={bank.id} className="flex items-center gap-3 p-2 hover:bg-zinc-50 rounded cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={selectedBanks.includes(bank.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBanks([...selectedBanks, bank.id]);
                            } else {
                              setSelectedBanks(selectedBanks.filter(id => id !== bank.id));
                            }
                          }}
                          className="w-4 h-4 text-indigo-600 rounded border-zinc-300 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-zinc-700">{bank.title}</span>
                      </label>
                    ))}
                    {banks.length === 0 && (
                      <div className="text-sm text-zinc-500 text-center py-2">No question banks available.</div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Total Questions to Generate</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={generateCount}
                    onChange={e => setGenerateCount(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <p className="text-xs text-zinc-500 mt-2">
                    Questions will be distributed equally among selected banks.
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsGenerating(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={selectedBanks.length === 0}
                    className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                  >
                    Generate
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isAdding && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">
                {editingQuestionId ? 'Edit Question' : 'Add New Question'}
              </h2>
              <form onSubmit={handleAddQuestion} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Question Text</label>
                  <textarea 
                    required
                    value={newQ.text}
                    onChange={e => setNewQ({...newQ, text: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                    placeholder="Enter the question here..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Reference Image (Optional)</label>
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewQ({...newQ, image_url: reader.result as string});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {newQ.image_url && (
                    <div className="mt-4 relative inline-block">
                      <img src={newQ.image_url} alt="Preview" className="h-32 rounded-lg border border-zinc-200 object-contain" />
                      <button 
                        type="button" 
                        onClick={() => setNewQ({ ...newQ, image_url: '' })}
                        className="absolute -top-2 -right-2 bg-white text-red-600 rounded-full p-1 shadow-md hover:bg-red-50 border border-zinc-200"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-zinc-700">Options (Select the correct one)</label>
                  {newQ.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="correct"
                        checked={newQ.correct === idx}
                        onChange={() => setNewQ({...newQ, correct: idx})}
                        className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <input 
                        type="text" 
                        required
                        value={opt}
                        onChange={e => {
                          const newOpts = [...newQ.options];
                          newOpts[idx] = e.target.value;
                          setNewQ({...newQ, options: newOpts});
                        }}
                        className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder={`Option ${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Save Question
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StudentDashboard = ({ student }: { student: User }) => {
  const [tests, setTests] = useState<Test[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    setIsRefreshing(true);
    const studentId = student.student_id || student.id.toString();
    
    try {
      const [testsData, resultsData] = await Promise.all([
        fetch(`/api/tests?batch=${encodeURIComponent(student.batch)}`).then(res => {
          if (!res.ok) throw new Error('Failed to fetch tests');
          return res.json();
        }),
        fetch(`/api/results?student_id=${encodeURIComponent(studentId)}`).then(res => {
          if (!res.ok) throw new Error('Failed to fetch results');
          return res.json();
        })
      ]);
      setTests(testsData);
      setResults(resultsData);
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [student.batch, student.student_id, student.id]);

  const getResultForTest = (testId: string) => {
    return results.find(r => r.test_id === testId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Welcome, {student.username}</h1>
          <p className="text-zinc-500">Available tests for batch: <span className="font-bold text-indigo-600">{student.batch}</span></p>
        </div>
        <button 
          onClick={fetchData}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-600 font-semibold hover:bg-zinc-50 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Tests'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map(test => {
          const result = getResultForTest(test.id);
          const isCompleted = !!result;

          return (
            <motion.div 
              key={test.id}
              whileHover={{ y: -4 }}
              className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={cn(
                  "p-2 rounded-lg",
                  isCompleted ? "bg-emerald-50" : "bg-indigo-50"
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <ClipboardList className="w-6 h-6 text-indigo-600" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 bg-zinc-50 px-2 py-1 rounded-full">
                  <Clock className="w-3 h-3" />
                  <span>{test.duration_minutes}m</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">{test.title}</h3>
              {test.negative_marks === 1 && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 uppercase tracking-wider mb-2">
                  <XCircle className="w-3 h-3" /> Negative Marking Enabled
                </div>
              )}
              <p className="text-zinc-500 text-sm mb-6 flex-grow">{test.description}</p>
              
              {isCompleted ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <span className="text-sm font-medium text-emerald-700">Total Score</span>
                    <span className="text-sm font-bold text-emerald-700">{result.score}</span>
                  </div>
                  <button 
                    onClick={() => navigate(`/student/results/${test.id}`)}
                    className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    View Results <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => navigate(`/student/test/${test.id}`)}
                  className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  Start Test <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          );
        })}
        {tests.length === 0 && (
          <div className="col-span-full py-20 text-center bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl">
            <p className="text-zinc-400">No tests are currently available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const TestSession = ({ student }: { student: User }) => {
  const { id } = useParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [testDetails, setTestDetails] = useState<Test | null>(null);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showStartModal, setShowStartModal] = useState(true);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [fullScreenExitCount, setFullScreenExitCount] = useState(0);
  const [proctoringWarning, setProctoringWarning] = useState<{title: string, message: string, type: 'warning' | 'violation'} | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    let finalScore = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_option_index) {
        finalScore++;
      } else if (answers[q.id] !== undefined && testDetails?.negative_marks) {
        finalScore--;
      }
    });
    const calculatedScore = testDetails?.negative_marks ? Math.max(0, finalScore) : finalScore;
    setScore(calculatedScore);
    setIsFinished(true);

    await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        test_id: id!,
        student_name: student.username,
        student_id: student.student_id || student.id.toString(),
        score: calculatedScore,
        total_questions: questions.length,
        responses: answers
      })
    });
  };

  const handleSubmitRef = useRef<() => void>(handleSubmit);

  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  useEffect(() => {
    if (!hasStarted || isFinished) return;

    const handleVisibilityChange = () => {
      if (document.hidden && hasStarted && !isFinished) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          if (newCount === 1) {
            setProctoringWarning({
              title: "Tab Switch Detected",
              message: "Warning: Switching tabs is strictly prohibited. Please stay on this tab. Next violation will result in automatic submission.",
              type: 'warning'
            });
          } else {
            setProctoringWarning({
              title: "Proctoring Violation",
              message: "Multiple tab switches detected. Your test is being submitted automatically.",
              type: 'violation'
            });
            handleSubmitRef.current();
          }
          return newCount;
        });
      }
    };

    const handleBlur = () => {
      // Small delay to avoid triggering on alert itself
      setTimeout(() => {
        if (!document.hasFocus() && hasStarted && !isFinished) {
          // If document is hidden, it's handled by visibilitychange
          if (document.hidden) return;

          setTabSwitchCount(prev => {
            const newCount = prev + 1;
            if (newCount === 1) {
              setProctoringWarning({
                title: "Focus Lost",
                message: "Warning: You navigated away from the test window. Please keep the test window focused. Next violation will result in automatic submission.",
                type: 'warning'
              });
            } else {
              setProctoringWarning({
                title: "Proctoring Violation",
                message: "Multiple focus loss incidents detected. Your test is being submitted automatically.",
                type: 'violation'
              });
              handleSubmitRef.current();
            }
            return newCount;
          });
        }
      }, 100);
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    const handleFullScreenChange = () => {
      if (!document.fullscreenElement && hasStarted && !isFinished) {
        setFullScreenExitCount(prev => {
          const newCount = prev + 1;
          if (newCount === 1) {
            setProctoringWarning({
              title: "Full-Screen Required",
              message: "Warning: Full-screen mode is required for this test. Please re-enable it immediately. Further violations will result in automatic submission.",
              type: 'warning'
            });
          } else {
            setProctoringWarning({
              title: "Proctoring Violation",
              message: "Multiple full-screen exits detected. Your test is being submitted automatically.",
              type: 'violation'
            });
            handleSubmitRef.current();
          }
          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCopy);
    document.addEventListener('paste', handleCopy);
    document.addEventListener('selectstart', handleContextMenu);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('MSFullscreenChange', handleFullScreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCopy);
      document.removeEventListener('paste', handleCopy);
      document.removeEventListener('selectstart', handleContextMenu);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
    };
  }, [hasStarted, isFinished]);

  useEffect(() => {
    const studentId = student.student_id || student.id.toString();
    
    // Check if test already completed
    fetch(`/api/results?student_id=${encodeURIComponent(studentId)}`)
      .then(res => res.json())
      .then(results => {
        const alreadyDone = results.some((r: any) => r.test_id === id);
        if (alreadyDone) {
          alert('You have already completed this test.');
          navigate('/student/dashboard');
        }
      });

    fetch(`/api/tests/${id}/questions`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch questions');
        return res.json();
      })
      .then(data => {
        setQuestions(data);
        // Fetch test details for duration
        fetch('/api/tests')
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch test details');
            return res.json();
          })
          .then(tests => {
            const test = tests.find((t: any) => t.id === id);
            if (test) {
              setTestDetails(test);
              setTimeLeft(test.duration_minutes * 60);
            }
          });
      });
  }, [id, student.student_id, student.id, navigate]);

  useEffect(() => {
    if (timeLeft === null || isFinished || !hasStarted) return;
    if (timeLeft === 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev! - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isFinished, hasStarted]);

  const handleStartTest = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.error("Error enabling full-screen:", err);
    }
    setHasStarted(true);
    setShowStartModal(false);
  };

  if (questions.length === 0) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  if (showStartModal) {
    return (
      <div className="fixed inset-0 bg-zinc-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl w-full max-w-xl p-10 shadow-2xl border border-zinc-200"
        >
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
            <Settings className="w-8 h-8 text-indigo-600 animate-spin-slow" />
          </div>
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">Test Instructions & Proctoring</h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            Please read the following instructions carefully before starting the test:
          </p>
          
          <div className="space-y-4 mb-10">
            <div className="flex items-start gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <LayoutDashboard className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900">Full-Screen Mode</h4>
                <p className="text-sm text-zinc-500">The test runs in full-screen. Exiting twice will result in automatic submission.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <RefreshCw className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-amber-900">No Tab Switching</h4>
                <p className="text-sm text-amber-700/70">Switching tabs or windows is strictly prohibited. You will receive one warning. A second violation will result in automatic submission.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-red-50 rounded-2xl border border-red-100">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <XCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-red-900">Content Protection</h4>
                <p className="text-sm text-red-700/70">Right-click, text selection, and copy/paste are disabled.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/student')}
              className="flex-1 px-6 py-4 rounded-2xl font-bold text-zinc-600 hover:bg-zinc-100 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleStartTest}
              className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              I Understand, Start Test
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isFinished) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <AnimatePresence>
          {proctoringWarning && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-zinc-200 text-center"
              >
                <div className={cn(
                  "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6",
                  proctoringWarning.type === 'warning' ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
                )}>
                  {proctoringWarning.type === 'warning' ? (
                    <Settings className="w-10 h-10 animate-pulse" />
                  ) : (
                    <XCircle className="w-10 h-10" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-3">{proctoringWarning.title}</h3>
                <p className="text-zinc-600 mb-8 leading-relaxed">
                  {proctoringWarning.message}
                </p>
                
                {proctoringWarning.type === 'warning' ? (
                  <button
                    onClick={async () => {
                      try {
                        if (document.documentElement.requestFullscreen) {
                          await document.documentElement.requestFullscreen();
                        }
                        setProctoringWarning(null);
                      } catch (err) {
                        console.error("Failed to re-enter full screen:", err);
                        setProctoringWarning(null);
                      }
                    }}
                    className="w-full bg-amber-500 text-white py-3.5 rounded-xl font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-100"
                  >
                    {proctoringWarning.title === 'Full-Screen Required' ? 'Re-enable Full Screen' : 'I Understand & Resume'}
                  </button>
                ) : (
                  <button
                    onClick={() => setProctoringWarning(null)}
                    className="w-full bg-red-600 text-white py-3.5 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                  >
                    View Results
                  </button>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="max-w-2xl w-full text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border border-zinc-200 rounded-3xl p-12 shadow-xl"
          >
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">Test Completed!</h1>
            <p className="text-zinc-500 mb-8">Well done, {student.username}. Here is your performance summary.</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                <span className="block text-sm font-medium text-zinc-500 mb-1">Score</span>
                <span className="text-3xl font-bold text-zinc-900">{score}</span>
              </div>
              <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                <span className="block text-sm font-medium text-zinc-500 mb-1">Percentage</span>
                <span className="text-3xl font-bold text-zinc-900">{Math.round(percentage)}%</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/student')}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Back to Dashboard
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  if (!currentQ && !isFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 font-medium">Loading test questions...</p>
        </div>
      </div>
    );
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs < 10 ? '0' : ''}${rs}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      <AnimatePresence>
        {proctoringWarning && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-zinc-200 text-center"
            >
              <div className={cn(
                "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6",
                proctoringWarning.type === 'warning' ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
              )}>
                {proctoringWarning.type === 'warning' ? (
                  <Settings className="w-10 h-10 animate-pulse" />
                ) : (
                  <XCircle className="w-10 h-10" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-3">{proctoringWarning.title}</h3>
              <p className="text-zinc-600 mb-8 leading-relaxed">
                {proctoringWarning.message}
              </p>
              
              {proctoringWarning.type === 'warning' ? (
                <button
                  onClick={async () => {
                    try {
                      if (document.documentElement.requestFullscreen) {
                        await document.documentElement.requestFullscreen();
                      }
                      setProctoringWarning(null);
                    } catch (err) {
                      console.error("Failed to re-enter full screen:", err);
                      setProctoringWarning(null);
                    }
                  }}
                  className="w-full bg-amber-500 text-white py-3.5 rounded-xl font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-100"
                >
                  {proctoringWarning.title === 'Full-Screen Required' ? 'Re-enable Full Screen' : 'I Understand & Resume'}
                </button>
              ) : (
                <button
                  onClick={() => setIsFinished(true)}
                  className="w-full bg-red-600 text-white py-3.5 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                >
                  View Results
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Question Area */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl border border-zinc-200 sticky top-20 z-40">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                {currentIdx + 1}
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Progress</span>
                <div className="w-48 h-2 bg-zinc-100 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-lg",
                timeLeft! < 60 ? "bg-red-50 text-red-600 animate-pulse" : "bg-zinc-50 text-zinc-700"
              )}>
                <Clock className="w-5 h-5" />
                {formatTime(timeLeft || 0)}
              </div>
              {testDetails?.negative_marks === 1 && (
                <div className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-red-100">
                  <XCircle className="w-3.5 h-3.5" /> Negative Marking
                </div>
              )}
            </div>
          </div>

          <motion.div 
            key={currentIdx}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm mb-8 select-none"
            onContextMenu={(e) => e.preventDefault()}
          >
            <h2 className="text-2xl font-bold text-zinc-900 mb-8">{currentQ.question_text}</h2>
            {currentQ.image_url && (
              <div className="mb-8">
                <img src={currentQ.image_url} alt="Reference" className="max-w-full h-auto rounded-lg shadow-sm border border-zinc-200 max-h-64 object-contain" />
              </div>
            )}
            <div className="space-y-4">
              {currentQ.options.map((opt, idx) => (
                <button 
                  key={opt.id}
                  onClick={() => setAnswers({...answers, [currentQ.id]: idx})}
                  className={cn(
                    "w-full p-5 rounded-xl border-2 text-left transition-all flex items-center justify-between group",
                    answers[currentQ.id] === idx 
                      ? "border-indigo-600 bg-indigo-50 text-indigo-900" 
                      : "border-zinc-100 hover:border-zinc-300 text-zinc-600 hover:bg-zinc-50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                      answers[currentQ.id] === idx ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200"
                    )}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-medium">{opt.option_text}</span>
                  </div>
                  {answers[currentQ.id] === idx && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="flex justify-between items-center">
            <button 
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => prev - 1)}
              className="px-6 py-3 rounded-xl font-semibold text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 transition-colors"
            >
              Previous
            </button>
            {currentIdx === questions.length - 1 ? (
              <button 
                onClick={() => setShowSubmitConfirmation(true)}
                className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md"
              >
                Submit Test
              </button>
            ) : (
              <button 
                onClick={() => setCurrentIdx(prev => prev + 1)}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"
              >
                Next Question <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Question Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm sticky top-20">
            <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-indigo-600" />
              Question Palette
            </h3>
            
            <div className="grid grid-cols-5 gap-2 mb-6">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = currentIdx === idx;
                
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={cn(
                      "w-full aspect-square rounded-lg font-bold text-sm transition-all border flex items-center justify-center",
                      isCurrent 
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md scale-110 z-10" 
                        : isAnswered 
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200" 
                          : "bg-zinc-50 text-zinc-400 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100"
                    )}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="space-y-3 pt-4 border-t border-zinc-100">
              <div className="flex items-center gap-3 text-xs font-medium text-zinc-500">
                <div className="w-3 h-3 rounded bg-indigo-600" />
                <span>Current Question</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-zinc-500">
                <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-zinc-500">
                <div className="w-3 h-3 rounded bg-zinc-50 border border-zinc-200" />
                <span>Unanswered</span>
              </div>
            </div>

            <div className="mt-8">
              <button 
                type="button"
                onClick={() => setShowSubmitConfirmation(true)}
                className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-sm flex items-center justify-center gap-2"
              >
                Finish Test
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSubmitConfirmation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-zinc-200"
            >
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Submit Test?</h3>
              <p className="text-zinc-500 mb-6">
                Are you sure you want to finish the test? You won't be able to change your answers after submitting.
              </p>
              
              <div className="bg-zinc-50 rounded-xl p-4 mb-6 border border-zinc-100">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-500">Total Questions</span>
                  <span className="font-bold text-zinc-900">{questions.length}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-500">Answered</span>
                  <span className="font-bold text-emerald-600">{Object.keys(answers).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Unanswered</span>
                  <span className="font-bold text-amber-600">{questions.length - Object.keys(answers).length}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowSubmitConfirmation(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowSubmitConfirmation(false);
                    handleSubmit();
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Confirm Submit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

const BankQuestionsManagement = () => {
  const { id } = useParams();
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [bankDetails, setBankDetails] = useState<QuestionBank | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [newBankTitle, setNewBankTitle] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<BankQuestion | null>(null);
  const [showDeleteBankConfirm, setShowDeleteBankConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newQ, setNewQ] = useState({
    text: '',
    options: ['', '', '', ''],
    correct: 0,
    image_url: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
    fetchBankDetails();
  }, [id]);

  const fetchBankDetails = async () => {
    const res = await fetch(`/api/question-banks/${id}`);
    if (res.ok) {
      const data = await res.json();
      setBankDetails(data);
      setNewBankTitle(data.title);
    }
  };

  const fetchQuestions = async () => {
    const res = await fetch(`/api/question-banks/${id}/questions`);
    const data = await res.json();
    setQuestions(data);
  };

  const handleUpdateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/question-banks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newBankTitle })
      });
      if (res.ok) {
        setIsEditingBank(false);
        fetchBankDetails();
      }
    } catch (error) {
      console.error('Failed to update question bank:', error);
    }
  };

  const handleDeleteBank = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/question-banks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        navigate('/admin');
      }
    } catch (error) {
      console.error('Failed to delete question bank:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteBankConfirm(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingQuestionId 
        ? `/api/bank-questions/${editingQuestionId}`
        : `/api/question-banks/${id}/questions`;
        
      const method = editingQuestionId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_text: newQ.text,
          correct_option_index: newQ.correct,
          options: newQ.options,
          image_url: newQ.image_url
        })
      });
      
      if (res.ok) {
        setIsAdding(false);
        setNewQ({ text: '', options: ['', '', '', ''], correct: 0, image_url: '' });
        setEditingQuestionId(null);
        fetchQuestions();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save question");
      }
    } catch (error) {
      console.error("Save bank question error:", error);
      alert("Error saving question. The image might be too large.");
    }
  };

  const handleEditQuestion = (q: BankQuestion) => {
    setNewQ({
      text: q.question_text,
      options: q.options.map(o => o.option_text),
      correct: q.correct_option_index,
      image_url: q.image_url || ''
    });
    setEditingQuestionId(q.id);
    setIsAdding(true);
  };

  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/bank-questions/${questionToDelete.id}`, { method: 'DELETE' });
      fetchQuestions();
      setQuestionToDelete(null);
    } catch (error) {
      console.error('Failed to delete question:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/admin')}
        className="flex items-center gap-2 text-zinc-500 hover:text-indigo-600 transition-colors mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-3">
            {isEditingBank ? (
              <form onSubmit={handleUpdateBank} className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={newBankTitle}
                  onChange={e => setNewBankTitle(e.target.value)}
                  className="px-3 py-1 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 outline-none text-xl"
                  autoFocus
                />
                <button type="submit" className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200">
                  <CheckCircle2 className="w-5 h-5" />
                </button>
                <button type="button" onClick={() => { setIsEditingBank(false); setNewBankTitle(bankDetails?.title || ''); }} className="p-1.5 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-zinc-200">
                  <XCircle className="w-5 h-5" />
                </button>
              </form>
            ) : (
              <>
                {bankDetails?.title || 'Manage Bank Questions'}
                <button onClick={() => setIsEditingBank(true)} className="text-zinc-400 hover:text-indigo-600 transition-colors" title="Edit Bank Title">
                  <Edit2 className="w-5 h-5" />
                </button>
              </>
            )}
          </h1>
          <p className="text-zinc-500 mt-1">Manage questions in this bank</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowDeleteBankConfirm(true)}
            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-all shadow-sm"
            title="Delete Entire Bank"
          >
            <Trash2 className="w-5 h-5" />
            Delete Bank
          </button>
          <button 
            onClick={() => {
              setIsAdding(true);
              setEditingQuestionId(null);
              setNewQ({ text: '', options: ['', '', '', ''], correct: 0, image_url: '' });
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-sm"
          >
            <PlusCircle className="w-5 h-5" />
            Add Question
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white border border-zinc-200 rounded-xl p-6 relative group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Question {idx + 1}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEditQuestion(q)}
                  className="text-zinc-400 hover:text-indigo-600 transition-colors"
                  title="Edit Question"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setQuestionToDelete(q)}
                  className="text-zinc-400 hover:text-red-600 transition-colors"
                  title="Delete Question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-zinc-900 font-medium text-lg mb-6">{q.question_text}</p>
            {q.image_url && (
              <div className="mb-6">
                <img src={q.image_url} alt="Reference" className="max-w-full h-auto rounded-lg shadow-sm border border-zinc-200 max-h-48 object-contain" />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {q.options.map((opt, oIdx) => (
                <div 
                  key={opt.id}
                  className={cn(
                    "p-3 rounded-lg border text-sm flex items-center justify-between",
                    oIdx === q.correct_option_index 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-medium" 
                      : "bg-zinc-50 border-zinc-100 text-zinc-600"
                  )}
                >
                  <span>{opt.option_text}</span>
                  {oIdx === q.correct_option_index && <CheckCircle2 className="w-4 h-4" />}
                </div>
              ))}
            </div>
          </div>
        ))}
        {questions.length === 0 && (
          <div className="py-20 text-center bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl">
            <p className="text-zinc-400">No questions added yet. Click "Add Question" to begin.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showDeleteBankConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-zinc-200"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900">Delete Question Bank?</h3>
                  <p className="text-zinc-500 text-sm">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-zinc-600 mb-8">
                Are you sure you want to delete this entire question bank? This will permanently delete all questions inside this bank.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteBankConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteBank}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm flex justify-center items-center"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Bank'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {questionToDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-6">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">Delete Question?</h2>
              <p className="text-zinc-600 mb-6">
                Are you sure you want to delete this question? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setQuestionToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium text-zinc-600 hover:bg-zinc-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteQuestion}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isAdding && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">
                {editingQuestionId ? 'Edit Bank Question' : 'Add New Bank Question'}
              </h2>
              <form onSubmit={handleAddQuestion} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Question Text</label>
                  <textarea 
                    required
                    value={newQ.text}
                    onChange={e => setNewQ({...newQ, text: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                    placeholder="Enter the question here..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Reference Image (Optional)</label>
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewQ({...newQ, image_url: reader.result as string});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {newQ.image_url && (
                    <div className="mt-4 relative inline-block">
                      <img src={newQ.image_url} alt="Preview" className="h-32 rounded-lg border border-zinc-200 object-contain" />
                      <button 
                        type="button" 
                        onClick={() => setNewQ({ ...newQ, image_url: '' })}
                        className="absolute -top-2 -right-2 bg-white text-red-600 rounded-full p-1 shadow-md hover:bg-red-50 border border-zinc-200"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-zinc-700">Options (Select the correct one)</label>
                  {newQ.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="correct"
                        checked={newQ.correct === idx}
                        onChange={() => setNewQ({...newQ, correct: idx})}
                        className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <input 
                        type="text" 
                        required
                        value={opt}
                        onChange={e => {
                          const newOpts = [...newQ.options];
                          newOpts[idx] = e.target.value;
                          setNewQ({...newQ, options: newOpts});
                        }}
                        className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder={`Option ${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Save Question
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ResultDetailView = ({ student }: { student: User }) => {
  const { testId } = useParams();
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const studentId = student.student_id || student.id.toString();
    
    Promise.all([
      fetch(`/api/tests`).then(res => {
        if (!res.ok) throw new Error('Failed to fetch tests');
        return res.json();
      }),
      fetch(`/api/tests/${testId}/questions`).then(res => {
        if (!res.ok) throw new Error('Failed to fetch questions');
        return res.json();
      }),
      fetch(`/api/results?student_id=${encodeURIComponent(studentId)}`).then(res => {
        if (!res.ok) throw new Error('Failed to fetch results');
        return res.json();
      })
    ]).then(([testsData, questionsData, resultsData]) => {
      const currentTest = testsData.find((t: any) => t.id === testId);
      const currentResult = resultsData.find((r: any) => r.test_id === testId);
      
      setTest(currentTest);
      setQuestions(questionsData);
      setResult(currentResult);
      setLoading(false);
    });
  }, [testId, student.student_id, student.id]);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading results...</div>;
  if (!result || !test) return <div className="p-8 text-center">Result not found.</div>;

  const studentAnswers = result.responses ? JSON.parse(result.responses) : {};
  
  const stats = questions.reduce((acc, q) => {
    const selectedIdx = studentAnswers[q.id];
    if (selectedIdx === undefined) acc.skipped++;
    else if (selectedIdx === q.correct_option_index) acc.correct++;
    else acc.incorrect++;
    return acc;
  }, { correct: 0, incorrect: 0, skipped: 0 });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/student/dashboard')}
        className="flex items-center gap-2 text-zinc-500 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">{test.title} - Results</h1>
            <p className="text-zinc-500">Completed on {new Date(result.completed_at).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-8">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="px-3 py-1 bg-emerald-50 rounded-lg">
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Correct</div>
                <div className="text-lg font-bold text-emerald-700">{stats.correct}</div>
              </div>
              <div className="px-3 py-1 bg-red-50 rounded-lg">
                <div className="text-xs font-bold text-red-600 uppercase tracking-wider">Wrong</div>
                <div className="text-lg font-bold text-red-700">{stats.incorrect}</div>
              </div>
              <div className="px-3 py-1 bg-zinc-100 rounded-lg">
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Skipped</div>
                <div className="text-lg font-bold text-zinc-600">{stats.skipped}</div>
              </div>
            </div>
            <div className="h-12 w-px bg-zinc-200" />
            <div className="text-right">
              <div className="text-4xl font-bold text-indigo-600">{result.score}</div>
              <div className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Final Score</div>
            </div>
          </div>
        </div>
        {test.negative_marks === 1 && (
          <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Negative marking was active for this test (-1 for each wrong answer). Final score is capped at 0.
          </div>
        )}
      </div>

      <div className="space-y-8">
        {questions.map((q, idx) => {
          const selectedIdx = studentAnswers[q.id];
          const isCorrect = selectedIdx === q.correct_option_index;

          return (
            <div key={q.id} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Question {idx + 1}</span>
                {selectedIdx === undefined ? (
                  <span className="text-xs font-bold text-zinc-400 bg-zinc-100 px-2 py-1 rounded-full">Not Answered</span>
                ) : isCorrect ? (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Correct
                  </span>
                ) : (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Incorrect
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-zinc-900 mb-4">{q.question_text}</h3>
              
              {q.image_url && (
                <div className="mb-6 rounded-xl overflow-hidden border border-zinc-200">
                  <img src={q.image_url} alt="Question" className="max-w-full h-auto mx-auto" referrerPolicy="no-referrer" />
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                {q.options.map((opt, oIdx) => {
                  const isSelected = selectedIdx === oIdx;
                  const isCorrectOption = q.correct_option_index === oIdx;
                  
                  let bgColor = "bg-zinc-50 border-zinc-200";
                  let textColor = "text-zinc-700";
                  let icon = null;

                  if (isCorrectOption) {
                    bgColor = "bg-emerald-50 border-emerald-200";
                    textColor = "text-emerald-700";
                    icon = <CheckCircle2 className="w-4 h-4" />;
                  } else if (isSelected && !isCorrect) {
                    bgColor = "bg-red-50 border-red-200";
                    textColor = "text-red-700";
                    icon = <XCircle className="w-4 h-4" />;
                  }

                  return (
                    <div 
                      key={opt.id}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border transition-all",
                        bgColor,
                        textColor
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-white/50 flex items-center justify-center text-xs font-bold">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="font-medium">{opt.option_text}</span>
                      </div>
                      {icon}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isChangingOwnPassword, setIsChangingOwnPassword] = useState(false);
  const [newOwnPassword, setNewOwnPassword] = useState('');

  const handleLogin = (user: User) => {
    setUser(user);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleOwnPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const res = await fetch('/api/users/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, newPassword: newOwnPassword })
    });

    if (res.ok) {
      setIsChangingOwnPassword(false);
      setNewOwnPassword('');
      alert('Password updated successfully');
    } else {
      alert('Failed to update password');
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
        <Navbar 
          user={user} 
          onLogout={handleLogout} 
          onChangePassword={() => setIsChangingOwnPassword(true)}
        />
        
        <main>
          {!user ? (
            <LoginView onLogin={handleLogin} />
          ) : (
            <Routes>
              {user.role === 'admin' ? (
                <>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/test/:id" element={<TestManagement />} />
                  <Route path="/admin/banks/:id" element={<BankQuestionsManagement />} />
                  <Route path="*" element={<AdminDashboard />} />
                </>
              ) : (
                <>
                  <Route path="/student" element={<StudentDashboard student={user} />} />
                  <Route path="/student/test/:id" element={<TestSession student={user} />} />
                  <Route path="/student/results/:testId" element={<ResultDetailView student={user} />} />
                  <Route path="*" element={<StudentDashboard student={user} />} />
                </>
              )}
            </Routes>
          )}
        </main>

        <AnimatePresence>
          {isChangingOwnPassword && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl"
              >
                <h2 className="text-2xl font-bold text-zinc-900 mb-6">Change Your Password</h2>
                <form onSubmit={handleOwnPasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">New Password</label>
                    <input 
                      type="password" 
                      required
                      autoFocus
                      value={newOwnPassword}
                      onChange={e => setNewOwnPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => {
                        setIsChangingOwnPassword(false);
                        setNewOwnPassword('');
                      }}
                      className="flex-1 px-4 py-2.5 rounded-lg font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
}
