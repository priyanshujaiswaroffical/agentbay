import React, { useState, useEffect } from 'react';
import { Plus, Eye, EyeOff, Lock } from 'lucide-react';
import { playErrorSound } from '../services/soundService';

export type UserRole = 'buyer' | 'seller' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  createdAt: string;
  balance: number;
  pwHash: string; // simple hash of password
}

interface LoginScreenProps {
  onLogin: (user: UserProfile) => void;
}

const AVATARS = ['👤', '🤖', '🛒', '🏪', '🧑‍💼', '👩‍💼', '🦾', '🧠', '💼', '🌐'];



// Each browser tab/device gets its own storage key — users only see accounts they created here
const DEVICE_KEY = (() => {
  let k = localStorage.getItem('agentbay_device_id');
  if (!k) {
    k = 'dev_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('agentbay_device_id', k);
  }
  return k;
})();

const STORAGE_KEY = `agentbay_users_${DEVICE_KEY}`;

// Simple deterministic hash (not secure, but prevents plaintext storage)
function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h.toString(16);
}

function loadUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let list: UserProfile[] = raw ? JSON.parse(raw) : [];
    if (!list.some(u => u.name.toLowerCase() === 'admin')) {
      list.push({
        id: 'user_admin',
        name: 'admin',
        role: 'admin',
        avatar: '🧠',
        createdAt: new Date().toISOString(),
        balance: 99999999,
        pwHash: simpleHash('admin'),
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
    return list;
  } catch {}
  return [];
}

function saveUsers(users: UserProfile[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('buyer');
  const [newAvatar, setNewAvatar] = useState(AVATARS[0]);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwError, setPwError] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setUsers(loadUsers());
  }, []);

  const handleCreateUser = () => {
    if (!newName.trim()) { setCreateError('Name is required.'); playErrorSound(); return; }
    if (!newPassword) { setCreateError('Password is required.'); playErrorSound(); return; }
    if (newPassword.length < 4) { setCreateError('Password must be at least 4 characters.'); playErrorSound(); return; }
    if (newPassword !== newPasswordConfirm) { setCreateError('Passwords do not match.'); playErrorSound(); return; }

    // Check if user already exists
    if (users.some(u => u.name.toLowerCase() === newName.trim().toLowerCase())) {
      setCreateError('An account with this name already exists.');
      playErrorSound();
      return;
    }

    setCreating(true);
    const profile: UserProfile = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: newName.trim(),
      role: newRole,
      avatar: newAvatar,
      createdAt: new Date().toISOString(),
      balance: newRole === 'seller' ? 0 : newRole === 'admin' ? 99999999 : 250000,
      pwHash: simpleHash(newPassword),
    };
    const updated = [...users, profile];
    saveUsers(updated);
    setUsers(updated);
    setShowCreate(false);
    setNewName('');
    setNewPassword('');
    setNewPasswordConfirm('');
    setCreating(false);
    onLogin(profile);
  };

  const handleLogin = () => {
    if (!loginName.trim()) { setPwError('Username is required.'); playErrorSound(); return; }
    if (!password) { setPwError('Password is required.'); playErrorSound(); return; }
    
    const matched = users.find(u => u.name.toLowerCase() === loginName.trim().toLowerCase());
    if (!matched) {
      setPwError('Account not found. Click "New Account" to register.');
      playErrorSound();
      return;
    }
    
    const expected = matched.pwHash;
    if (simpleHash(password) === expected) {
      onLogin(matched);
    } else {
      setPwError('Incorrect password. Please try again.');
      playErrorSound();
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1e3e 40%, #0f3460 75%, #0a4040 100%)' }}
    >
      {/* Animated rotating grid lines */}
      <div className="absolute inset-0 pointer-events-none login-grid-anim" style={{ zIndex: 1 }} />

      {/* Animated glass bubbles */}
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          className="desktop-bubble"
          style={{
            width: `${30 + i * 18}px`,
            height: `${30 + i * 18}px`,
            left: `${5 + i * 10}%`,
            bottom: `-${50 + i * 20}px`,
            animationDuration: `${10 + i * 3}s`,
            animationDelay: `${i * 1.5}s`,
            opacity: 0.55,
          }}
        />
      ))}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0054e3] via-[#00c8ff] to-[#3cc03c]" style={{ zIndex: 10 }} />

      {/* Logo */}
      <div className="text-center mb-8 relative" style={{ zIndex: 20 }}>
        <div className="text-5xl mb-3 drop-shadow-lg">🏆</div>
        <h1 className="text-3xl font-black text-white tracking-widest"
          style={{ textShadow: '0 0 30px rgba(100,200,255,0.6)' }}>
          AGENTBAY
        </h1>
        <p className="text-[#90d0ff] text-xs font-mono tracking-widest mt-1">
          THE WORLD'S FIRST AI AGENT MARKETPLACE
        </p>
      </div>

      {/* Login Card */}
      <div className="relative w-[460px] bg-[#ece9d8] border-t-4 border-[#0054e3] shadow-2xl"
        style={{ zIndex: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}>

        <div className="xp-titlebar px-3 py-1.5 flex items-center gap-2">
          <span className="text-lg">👤</span>
          <span className="font-bold text-sm">User Accounts — AgentBay OS</span>
        </div>

        <div className="p-5">
          {!showCreate ? (
            <>
              <p className="text-xs text-gray-600 mb-3 font-semibold flex items-center gap-1">
                <Lock size={11} className="text-gray-400" />
                Please enter your credentials to log in.
              </p>

              {/* Login Credentials Inputs */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">
                    👤 Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="xp-input w-full text-xs"
                    value={loginName}
                    onChange={e => { setLoginName(e.target.value); setPwError(''); }}
                    placeholder="Enter your username"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Lock size={10} /> Password <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-1">
                    <input
                      type={showPw ? 'text' : 'password'}
                      className="xp-input flex-1 text-xs"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setPwError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()}
                      placeholder="Enter your password"
                    />
                    <button onClick={() => setShowPw(!showPw)} className="xp-btn px-2 py-1">
                      {showPw ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                  {pwError && <p className="text-[10px] text-red-600 mt-1 font-semibold">{pwError}</p>}
                </div>
              </div>

              <div className="flex gap-2 justify-between">
                <button
                  onClick={() => setShowCreate(true)}
                  className="xp-btn flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
                >
                  <Plus size={12} /> New Account
                </button>
                <button
                  onClick={handleLogin}
                  className="px-5 py-1.5 text-xs font-bold text-white rounded"
                  style={{ background: 'linear-gradient(to bottom, #3f8cf3, #0054e3)' }}
                >
                  Log In →
                </button>
              </div>
            </>
          ) : (
            /* Create New Account Form */
            <>
              <p className="text-xs font-bold text-gray-700 mb-3">Create New Account</p>

              {/* Avatar */}
              <div className="mb-3">
                <label className="block text-[10px] font-bold text-gray-700 mb-1">Choose Avatar:</label>
                <div className="flex gap-1.5 flex-wrap">
                  {AVATARS.map(av => (
                    <button key={av} onClick={() => setNewAvatar(av)}
                      className={`w-9 h-9 text-xl rounded border-2 transition-all ${
                        newAvatar === av ? 'border-[#0054e3] bg-[#dde8f8] scale-110' : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}>
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="mb-3">
                <label className="block text-[10px] font-bold text-gray-700 mb-1">Display Name <span className="text-red-500">*</span></label>
                <input type="text" className="xp-input w-full text-xs"
                  placeholder="e.g. Arjun, Shop Karo Deals, Admin Bot"
                  value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="block text-[10px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <Lock size={10} /> Password <span className="text-red-500">*</span>
                  <span className="text-gray-400 font-normal">(min 4 characters)</span>
                </label>
                <div className="flex gap-1">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    className="xp-input flex-1 text-xs"
                    placeholder="Choose a password"
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setCreateError(''); }}
                  />
                  <button onClick={() => setShowNewPw(!showNewPw)} className="xp-btn px-2 py-1">
                    {showNewPw ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-3">
                <label className="block text-[10px] font-bold text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  className="xp-input w-full text-xs"
                  placeholder="Re-enter password"
                  value={newPasswordConfirm}
                  onChange={e => { setNewPasswordConfirm(e.target.value); setCreateError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleCreateUser()}
                />
              </div>

              {/* Role */}
              <div className="mb-4">
                <label className="block text-[10px] font-bold text-gray-700 mb-1">Account Role:</label>
                <div className="space-y-2">
                  <button onClick={() => setNewRole('buyer')}
                    type="button"
                    className={`w-full flex items-center gap-3 p-2.5 rounded border text-xs text-left transition-all ${
                      newRole === 'buyer' ? 'bg-[#316ac5] text-white border-[#003c74]' : 'bg-white border-gray-300 hover:border-gray-400'
                    }`}>
                    <span className="text-2xl">🛒</span>
                    <div>
                      <div className="font-bold text-sm">Buyer</div>
                      <div className={`text-[10px] ${newRole === 'buyer' ? 'text-blue-200' : 'text-gray-500'}`}>
                        AI agents negotiate &amp; buy. Starts with ₹2,50,000 balance.
                      </div>
                    </div>
                  </button>
                  <button onClick={() => setNewRole('seller')}
                    type="button"
                    className={`w-full flex items-center gap-3 p-2.5 rounded border text-xs text-left transition-all ${
                      newRole === 'seller' ? 'bg-[#8b4513] text-white border-[#5c2d0a]' : 'bg-white border-gray-300 hover:border-gray-400'
                    }`}>
                    <span className="text-2xl">🏪</span>
                    <div>
                      <div className="font-bold text-sm">Seller</div>
                      <div className={`text-[10px] ${newRole === 'seller' ? 'text-amber-200' : 'text-gray-500'}`}>
                        List products. Your AI seller agent auto-negotiates deals.
                      </div>
                    </div>
                  </button>
                  <button onClick={() => setNewRole('admin')}
                    type="button"
                    className={`w-full flex items-center gap-3 p-2.5 rounded border text-xs text-left transition-all ${
                      newRole === 'admin' ? 'bg-[#b02008] text-white border-[#801000]' : 'bg-white border-gray-300 hover:border-gray-400'
                    }`}>
                    <span className="text-2xl">🧠</span>
                    <div>
                      <div className="font-bold text-sm">Administrator</div>
                      <div className={`text-[10px] ${newRole === 'admin' ? 'text-red-200' : 'text-gray-500'}`}>
                        Full system access. Manage configurations and listings.
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {createError && (
                <p className="text-[10px] text-red-600 font-semibold mb-2 bg-red-50 border border-red-200 rounded px-2 py-1">{createError}</p>
              )}

              <div className="flex gap-2 justify-between">
                <button onClick={() => { setShowCreate(false); setCreateError(''); }}
                  className="xp-btn px-3 py-1.5 text-xs font-semibold">← Back</button>
                <button onClick={handleCreateUser} disabled={creating}
                  className="px-5 py-1.5 text-xs font-bold text-white rounded disabled:opacity-50"
                  style={{ background: 'linear-gradient(to bottom, #3cc03c, #287428)' }}>
                  {creating ? 'Creating...' : 'Create & Login →'}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="bg-[#d4d0c8] border-t border-gray-400 px-4 py-2 text-[9px] text-gray-600 text-center">
          🔒 Accounts are private and stored locally. Other users cannot see your account.
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3cc03c] via-[#0054e3] to-[#00c8ff]" style={{ zIndex: 10 }} />
    </div>
  );
};

export function getStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem('agentbay_current_user');
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function storeCurrentUser(user: UserProfile | null): void {
  if (user) {
    localStorage.setItem('agentbay_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('agentbay_current_user');
  }
}
