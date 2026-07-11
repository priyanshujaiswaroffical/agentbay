import React, { useState, useEffect } from 'react';
import { Key, CheckCircle, XCircle, Loader, Cpu, Sliders, ShieldCheck, Bell, RefreshCw, Trash2, Store, Tag, PlusCircle, X } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey, getStoredModel, setStoredModel, testApiKey, type GeminiModel } from '../services/geminiService';
import type { UserProfile } from '../components/LoginScreen';
import { supabaseGetCategories, supabaseAddCategory, supabaseDeleteCategory } from '../services/supabaseService';

interface SettingsAppProps {
  controlSettings: {
    negotiationAggressiveness: number;
    minTrustScore: number;
    autoBuyLimit: number;
    soundEnabled: boolean;
    verificationRequired: boolean;
  };
  onUpdateSettings: (settings: Partial<{
    negotiationAggressiveness: number;
    minTrustScore: number;
    autoBuyLimit: number;
    soundEnabled: boolean;
    verificationRequired: boolean;
  }>) => void;
  currentUser: UserProfile | null;
  onShowNotification: (title: string, msg: string, type: 'info' | 'warning' | 'success') => void;
}

type Tab = 'general' | 'api' | 'agent' | 'account' | 'categories';

const DEFAULT_CATEGORIES = ['Laptops', 'Hardware', 'Datasets', 'Agent Services'];

export function getStoredCategories(): string[] {
  try {
    const s = localStorage.getItem('agentbay_categories');
    return s ? JSON.parse(s) : DEFAULT_CATEGORIES;
  } catch { return DEFAULT_CATEGORIES; }
}

export const SettingsApp: React.FC<SettingsAppProps> = ({
  controlSettings,
  onUpdateSettings,
  currentUser,
  onShowNotification,
}) => {
  const [tab, setTab] = useState<Tab>(currentUser?.role === 'admin' ? 'general' : 'account');
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [model, setModel] = useState<GeminiModel>(getStoredModel());
  const [keyStatus, setKeyStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
  const [localSettings, setLocalSettings] = useState({ ...controlSettings });
  const [dirty, setDirty] = useState(false);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [newCat, setNewCat] = useState('');

  const loadDBCategories = async () => {
    try {
      const dbCats = await supabaseGetCategories();
      if (dbCats.length > 0) {
        setCategories(dbCats);
        // Cache to localStorage for fast lookup in offline parts
        localStorage.setItem('agentbay_categories', JSON.stringify(dbCats));
      }
    } catch (e) {
      console.error('Failed to load DB categories:', e);
    }
  };

  useEffect(() => {
    loadDBCategories();
  }, []);

  useEffect(() => {
    setLocalSettings({ ...controlSettings });
  }, [controlSettings]);

  const handleSaveApi = () => {
    setStoredApiKey(apiKey.trim());
    setStoredModel(model);
    onShowNotification('Settings Saved', 'Gemini API key and model saved successfully.', 'success');
    setKeyStatus('idle');
  };

  const handleTestKey = async () => {
    setKeyStatus('testing');
    const ok = await testApiKey(apiKey.trim());
    setKeyStatus(ok ? 'ok' : 'fail');
  };

  const handleApply = () => {
    onUpdateSettings(localSettings);
    setDirty(false);
    onShowNotification('Settings Applied', 'Agent parameters updated. Changes take effect on next run.', 'success');
  };

  const updateLocal = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const aggressivenessLabel = ['Passive', 'Cautious', 'Balanced', 'Aggressive', 'Max Pressure'];

  const TABS = React.useMemo((): { id: Tab; label: string; icon: React.ReactNode }[] => {
    const all: { id: Tab; label: string; icon: React.ReactNode }[] = [
      { id: 'general',    label: 'General',        icon: <Sliders size={14} /> },
      { id: 'api',        label: 'AI Config',      icon: <Key size={14} /> },
      { id: 'agent',      label: 'Agent Behavior', icon: <Cpu size={14} /> },
      { id: 'categories', label: 'Categories',     icon: <Tag size={14} /> },
      { id: 'account',    label: 'My Account',     icon: <Store size={14} /> },
    ];
    if (currentUser?.role === 'admin') {
      return all;
    }
    return [{ id: 'account' as Tab, label: 'My Account', icon: <Store size={14} /> }];
  }, [currentUser]);

  return (
    <div className="flex h-full bg-white font-sans text-xs select-none">
      {/* Left Sidebar Nav */}
      <div className="w-[150px] bg-gradient-to-b from-[#0054e3] to-[#003db3] text-white flex flex-col">
        <div className="p-3 border-b border-[#1a6bf5]">
          <p className="font-bold text-[11px]">Control Panel</p>
          <p className="text-[9px] text-blue-200 mt-0.5">AgentBay Settings</p>
        </div>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-3 py-2.5 text-left text-[11px] font-semibold transition-colors border-b border-[#1a6bf5]/30 ${
              tab === t.id ? 'bg-white/20 border-l-2 border-l-white' : 'hover:bg-white/10'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
        <div className="mt-auto p-3 text-[9px] text-blue-300 leading-tight">
          Changes to agent behavior apply on next ShoppingAgent run.
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-[#ece9d8] border-b border-gray-300 px-4 py-2">
          <h1 className="font-bold text-[#002d96] text-sm">
            {tab === 'general'    ? '⚙️ General Settings' :
             tab === 'api'        ? '🔑 AI API Configuration' :
             tab === 'agent'      ? '🤖 Agent Behavior' :
             tab === 'categories' ? '🏷️ Category Management' : '👤 My Account'}
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* ── GENERAL TAB ── */}
          {tab === 'general' && (
            <>
              <Section title="Sound & Notifications" icon={<Bell size={14} />}>
                <Toggle label="Enable notification sounds" checked={localSettings.soundEnabled}
                  onChange={v => updateLocal('soundEnabled', v)} />
                <Toggle label="Require UAC verification popup for purchases" checked={localSettings.verificationRequired}
                  onChange={v => updateLocal('verificationRequired', v)} />
              </Section>

              <Section title="Security" icon={<ShieldCheck size={14} />}>
                <SliderRow
                  label="Minimum Seller Trust Score"
                  value={localSettings.minTrustScore}
                  min={50} max={100} step={5}
                  onChange={v => updateLocal('minTrustScore', v)}
                  display={`${localSettings.minTrustScore}%`}
                />
                <InputRow
                  label="Auto-Buy Price Ceiling (₹)"
                  value={localSettings.autoBuyLimit}
                  onChange={v => updateLocal('autoBuyLimit', v)}
                />
              </Section>

              <div className="flex justify-end pt-2">
                <button onClick={handleApply} disabled={!dirty}
                  className="xp-btn px-5 py-1.5 font-bold text-xs disabled:opacity-50">
                  {dirty ? '✓ Apply Changes' : 'No Changes'}
                </button>
              </div>
            </>
          )}

          {/* ── AI CONFIG TAB ── */}
          {tab === 'api' && (
            <>
              <Section title="Google Gemini API" icon={<Key size={14} />}>
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">API Key:</label>
                    <div className="flex gap-1">
                      <input
                        type="password"
                        className="xp-input flex-1 text-xs font-mono"
                        value={apiKey}
                        onChange={e => { setApiKey(e.target.value); setKeyStatus('idle'); }}
                        placeholder="AIza..."
                      />
                      <button
                        onClick={handleTestKey}
                        disabled={!apiKey.trim() || keyStatus === 'testing'}
                        className="xp-btn px-2 py-1 flex items-center gap-1 font-semibold disabled:opacity-50"
                      >
                        {keyStatus === 'testing' ? <Loader size={11} className="animate-spin" /> :
                         keyStatus === 'ok'      ? <CheckCircle size={11} className="text-green-600" /> :
                         keyStatus === 'fail'    ? <XCircle size={11} className="text-red-600" /> :
                         <RefreshCw size={11} />}
                        {keyStatus === 'testing' ? 'Testing...' :
                         keyStatus === 'ok'      ? 'Valid ✓' :
                         keyStatus === 'fail'    ? 'Invalid ✗' : 'Test'}
                      </button>
                    </div>
                    {keyStatus === 'ok' && <p className="text-[10px] text-green-600 mt-1">✓ API key is valid and working.</p>}
                    {keyStatus === 'fail' && <p className="text-[10px] text-red-600 mt-1">✗ API key is invalid or quota exceeded. Check your Google AI Studio.</p>}
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Model:</label>
                    <select
                      className="xp-input w-full text-xs"
                      value={model}
                      onChange={e => setModel(e.target.value as GeminiModel)}
                    >
                      <option value="gemini-3.5-flash">gemini-3.5-flash (Fastest — Default)</option>
                      <option value="gemini-2.5-flash">gemini-2.5-flash (Stable)</option>
                      <option value="gemini-2.0-flash">gemini-2.0-flash (Experimental)</option>
                      <option value="gemini-1.5-flash">gemini-1.5-flash (Legacy Fast)</option>
                      <option value="gemini-1.5-pro">gemini-1.5-pro (Legacy Pro)</option>
                    </select>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-2 rounded text-[10px] text-blue-700 leading-relaxed">
                    <strong>How to get an API key:</strong><br />
                    1. Visit <span className="font-mono">aistudio.google.com</span><br />
                    2. Click "Get API Key" → Create API Key<br />
                    3. Copy and paste above. Keys are FREE with generous quota.<br />
                    <span className="text-gray-500 mt-1 block">Key is saved in browser localStorage — never leaves your device.</span>
                  </div>

                  <button onClick={handleSaveApi}
                    className="xp-btn px-5 py-1.5 font-bold w-full text-center">
                    💾 Save API Configuration
                  </button>
                </div>
              </Section>
            </>
          )}

          {/* ── AGENT BEHAVIOR TAB ── */}
          {tab === 'agent' && (
            <>
              <Section title="Negotiation Strategy" icon={<Cpu size={14} />}>
                <SliderRow
                  label={`Aggressiveness: ${aggressivenessLabel[localSettings.negotiationAggressiveness - 1]}`}
                  value={localSettings.negotiationAggressiveness}
                  min={1} max={5} step={1}
                  onChange={v => updateLocal('negotiationAggressiveness', v)}
                  display={`${localSettings.negotiationAggressiveness}/5`}
                />
                <div className="text-[10px] text-gray-500 pl-1 -mt-1">
                  {localSettings.negotiationAggressiveness <= 2 && 'Agent will be polite, make small opening offers, accept faster.'}
                  {localSettings.negotiationAggressiveness === 3 && 'Agent will negotiate moderately — balanced discount extraction.'}
                  {localSettings.negotiationAggressiveness >= 4 && 'Agent will push hard for maximum discounts. May require more rounds.'}
                </div>
              </Section>

              <Section title="Budget & Limits" icon={<ShieldCheck size={14} />}>
                <InputRow
                  label="Maximum Budget per Purchase (₹)"
                  value={localSettings.autoBuyLimit}
                  onChange={v => updateLocal('autoBuyLimit', v)}
                />
                <SliderRow
                  label="Min Seller Trust Score Required"
                  value={localSettings.minTrustScore}
                  min={50} max={100} step={5}
                  onChange={v => updateLocal('minTrustScore', v)}
                  display={`${localSettings.minTrustScore}%`}
                />
              </Section>

              <div className="flex justify-end">
                <button onClick={handleApply} disabled={!dirty}
                  className="xp-btn px-5 py-1.5 font-bold disabled:opacity-50">
                  {dirty ? '✓ Apply Changes' : 'Up to Date'}
                </button>
              </div>
            </>
          )}

          {/* ── ACCOUNT TAB ── */}
          {tab === 'account' && currentUser && (
            <>
              <Section title="Profile" icon={<Store size={14} />}>
                <div className="flex items-center gap-4 p-3 bg-[#f5f5f5] border border-gray-200 rounded">
                  <div className="text-4xl">{currentUser.avatar}</div>
                  <div>
                    <div className="font-bold text-sm">{currentUser.name}</div>
                    <div className="text-[10px] text-gray-500 capitalize">Role: {currentUser.role}</div>
                    <div className="text-[10px] text-gray-500">
                      Member since: {new Date(currentUser.createdAt).toLocaleDateString()}
                    </div>
                    {currentUser.role === 'buyer' && (
                      <div className="text-[10px] text-green-700 font-bold">
                        Balance: ₹{(currentUser.balance || 0).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </Section>

              <Section title="Data Management" icon={<Trash2 size={14} />}>
                <button
                  onClick={() => {
                    if (confirm('Clear all saved transactions? This cannot be undone.')) {
                      localStorage.removeItem('agentbay_transactions');
                      onShowNotification('Data Cleared', 'Transaction history has been erased.', 'info');
                    }
                  }}
                  className="xp-btn px-3 py-1.5 text-red-700 border-red-400 font-semibold"
                >
                  🗑 Clear Transaction History
                </button>
              </Section>
            </>
          )}
          {/* ── CATEGORIES TAB (admin only) ── */}
          {tab === 'categories' && (
            <Section title="Product Categories" icon={<Tag size={14} />}>
              <p className="text-gray-500 text-[10px]">Manage the categories available to sellers when listing products.</p>
              <div className="space-y-1.5 mt-2">
                {categories.map(cat => (
                  <div key={cat} className="flex items-center justify-between bg-[#f6f6f0] border border-gray-200 rounded px-2 py-1.5">
                    <span className="font-semibold text-gray-800">{cat}</span>
                    {!DEFAULT_CATEGORIES.includes(cat) && (
                      <button
                        onClick={async () => {
                          try {
                            await supabaseDeleteCategory(cat);
                            onShowNotification('Categories', `Removed category: ${cat}`, 'info');
                            loadDBCategories();
                          } catch (e: any) {
                            onShowNotification('Categories', `Delete failed: ${e.message}`, 'warning');
                          }
                        }}
                        className="text-red-500 hover:text-red-700"
                        title="Delete category"
                      >
                        <X size={12} />
                      </button>
                    )}
                    {DEFAULT_CATEGORIES.includes(cat) && (
                      <span className="text-[9px] text-gray-400 italic">built-in</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  className="xp-input flex-1 text-xs"
                  placeholder="New category name..."
                  value={newCat}
                  onChange={e => setNewCat(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                />
                <button
                  onClick={async () => {
                    const trimmed = newCat.trim();
                    if (!trimmed || categories.includes(trimmed)) return;
                    try {
                      await supabaseAddCategory(trimmed);
                      setNewCat('');
                      onShowNotification('Categories', `Added category: ${trimmed}`, 'success');
                      loadDBCategories();
                    } catch (e: any) {
                      onShowNotification('Categories', `Add failed: ${e.message}`, 'warning');
                    }
                  }}
                  className="xp-btn px-3 py-1.5 flex items-center gap-1 font-bold text-green-700 border-green-500 bg-[#e8ffe8]"
                >
                  <PlusCircle size={12} />
                  Add
                </button>
              </div>
            </Section>
          )}

        </div>
      </div>
    </div>
  );
};

/* ── Small helper sub-components ── */
const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="border border-gray-300 rounded overflow-hidden">
    <div className="bg-[#ece9d8] px-3 py-2 flex items-center gap-2 font-bold text-gray-800 border-b border-gray-300">
      {icon} {title}
    </div>
    <div className="p-3 space-y-3 bg-white">{children}</div>
  </div>
);

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between">
    <label className="text-gray-700">{label}</label>
    <button
      onClick={() => onChange(!checked)}
      className={`w-10 h-5 rounded-full transition-colors relative ${checked ? 'bg-[#3cc03c]' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? 'left-5' : 'left-0.5'}`} />
    </button>
  </div>
);

const SliderRow: React.FC<{ label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; display: string }> =
  ({ label, value, min, max, step, onChange, display }) => (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="font-bold text-[#002d96]">{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 accent-[#0054e3] cursor-pointer" />
    </div>
  );

const InputRow: React.FC<{ label: string; value: number; onChange: (v: number) => void }> =
  ({ label, value, onChange }) => (
    <div className="flex items-center gap-2">
      <label className="text-gray-700 flex-1">{label}</label>
      <input type="number" className="xp-input w-28 text-xs text-right" value={value}
        onChange={e => onChange(Number(e.target.value))} />
    </div>
  );
