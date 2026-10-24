import React, { useState } from 'react';
import {
  X,
  Cloud,
  CloudOff,
  RefreshCw,
  LogOut,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  User,
  GitMerge,
  HardDrive,
} from 'lucide-react';
import { PlayerProgress } from '../types/game';
import { Sound } from '../game/audio';
import {
  ConflictResolutionChoice,
  formatSyncStatusLabel,
  SaveConflictDetails,
  SyncStatus,
} from '../game/cloudSync';

export interface AuthenticatedUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface ServerConfigState {
  googleAuthConfigured: boolean;
  googleClientId: string | null;
  databaseConfigured: boolean;
}

interface AccountModalProps {
  user: AuthenticatedUser | null;
  serverConfig: ServerConfigState;
  syncStatus: SyncStatus;
  syncError: string | null;
  progress: PlayerProgress;
  conflictDetails: SaveConflictDetails | null;
  onClose: () => void;
  onStartGoogleRedirect: () => void;
  onSubmitGoogleCredential: (idToken: string) => Promise<void>;
  onSyncNow: () => Promise<void>;
  onResolveConflict: (choice: ConflictResolutionChoice) => Promise<void>;
  onSignOut: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  user,
  serverConfig,
  syncStatus,
  syncError,
  progress,
  conflictDetails,
  onClose,
  onStartGoogleRedirect,
  onSyncNow,
  onResolveConflict,
  onSignOut,
  onDeleteAccount,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const statusLabel = formatSyncStatusLabel(syncStatus);

  const handleAction = async (fn: () => Promise<void>) => {
    setIsBusy(true);
    try {
      await fn();
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in"
      data-testid="account-modal"
    >
      <div className="w-full max-w-lg bg-[#1a110a] border-2 border-[#543319] rounded-2xl p-5 shadow-2xl text-[#f3f4f6] max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3d2313] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <Cloud className="w-6 h-6 text-[#f5c518]" />
            <div>
              <h2 className="font-kalam font-bold text-2xl text-[#f5d061] leading-none">
                Account & Cloud Save
              </h2>
              <p className="text-xs text-gray-400">
                Google Sign-In + Neon PostgreSQL Cloud Backup
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              Sound.playClick();
              onClose();
            }}
            aria-label="Close account modal"
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Status Banner */}
        <div
          data-testid="sync-status-banner"
          className={`mb-4 p-3 rounded-xl border flex items-center justify-between gap-2 text-xs font-semibold ${
            syncStatus === 'saved'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : syncStatus === 'syncing'
              ? 'bg-blue-950/60 border-blue-500/40 text-blue-200'
              : syncStatus === 'error'
              ? 'bg-red-950/60 border-red-500/50 text-red-200'
              : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {syncStatus === 'saved' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : syncStatus === 'syncing' ? (
              <RefreshCw className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />
            ) : syncStatus === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            ) : (
              <CloudOff className="w-4 h-4 text-amber-400 flex-shrink-0" />
            )}
            <div>
              <span data-testid="sync-status-text" className="font-bold block">
                {statusLabel}
              </span>
              {syncError && (
                <span className="text-[11px] text-red-300 font-normal block mt-0.5">
                  {syncError}
                </span>
              )}
            </div>
          </div>

          {user && (
            <button
              type="button"
              disabled={isBusy || syncStatus === 'syncing'}
              onClick={() => {
                Sound.playClick();
                handleAction(onSyncNow);
              }}
              data-testid="retry-sync-btn"
              className="px-3 py-1.5 bg-[#2b180d] hover:bg-[#3d2313] text-[#f5c518] border border-[#5a361c] rounded-lg text-xs font-bold flex items-center gap-1 transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{syncStatus === 'error' ? 'Retry' : 'Sync Now'}</span>
            </button>
          )}
        </div>

        {/* Save Conflict Resolution Prompt (if both local and cloud saves diverged) */}
        {user && conflictDetails && (
          <div
            data-testid="save-conflict-panel"
            className="mb-4 p-4 bg-amber-950/40 border-2 border-amber-500/70 rounded-2xl space-y-3"
          >
            <div className="flex items-start gap-2">
              <GitMerge className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-kalam font-bold text-lg text-amber-300 leading-tight">
                  Save Conflict Detected
                </h3>
                <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
                  Both this device and your Neon cloud account contain progress. Choose how you
                  would like to resolve your save:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#160d07] border border-[#422614] rounded-xl p-2.5">
                <span className="font-bold text-amber-300 block mb-1">This Device (Local)</span>
                <div className="text-gray-300 space-y-0.5 text-[11px]">
                  <div>Level {conflictDetails.localProgress.level} ({conflictDetails.localProgress.xp} XP)</div>
                  <div>{conflictDetails.localProgress.coins} Coins</div>
                  <div>{conflictDetails.localProgress.unlockedSkins.length} Pens Unlocked</div>
                </div>
              </div>
              <div className="bg-[#160d07] border border-[#422614] rounded-xl p-2.5">
                <span className="font-bold text-cyan-300 block mb-1">Cloud Account (Neon)</span>
                <div className="text-gray-300 space-y-0.5 text-[11px]">
                  <div>Level {conflictDetails.cloudSave.level} ({conflictDetails.cloudSave.xp} XP)</div>
                  <div>{conflictDetails.cloudSave.coins} Coins</div>
                  <div>{conflictDetails.cloudSave.unlockedPens.length} Pens Unlocked</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => handleAction(() => onResolveConflict('merge'))}
                data-testid="resolve-merge-btn"
                className="w-full py-2.5 px-3 bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-kalam font-bold text-sm rounded-xl shadow flex items-center justify-center gap-2 hover:brightness-110 transition"
              >
                <GitMerge className="w-4 h-4" />
                <span>Smart Merge Both Saves (Recommended — Keep All Unlocks)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleAction(() => onResolveConflict('keep_cloud'))}
                  data-testid="resolve-keep-cloud-btn"
                  className="py-2 px-3 bg-[#24150b] hover:bg-[#331e10] text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold transition"
                >
                  Use Cloud Save
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleAction(() => onResolveConflict('keep_local'))}
                  data-testid="resolve-keep-local-btn"
                  className="py-2 px-3 bg-[#24150b] hover:bg-[#331e10] text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition"
                >
                  Use This Device’s Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BEFORE SIGN-IN VIEW */}
        {!user ? (
          <div className="space-y-4">
            <div className="p-4 bg-[#24150b] border border-[#422614] rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2 text-[#f5d061] font-kalam font-bold text-lg">
                <ShieldCheck className="w-5 h-5 text-[#22c55e]" />
                <span>Secure Cloud Backup with Google & Neon</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Sign in with your Google account to back up your unlocked Matador pens, coins, XP,
                championship trophies, and match history to Neon PostgreSQL across devices.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 rounded-lg p-2">
                <HardDrive className="w-4 h-4 flex-shrink-0" />
                <span>
                  Offline play is always available! Your progress is automatically saved on this
                  device even without signing in.
                </span>
              </div>
            </div>

            {/* Sign in with Google Button */}
            <button
              type="button"
              data-testid="google-signin-btn"
              onClick={() => {
                Sound.playClick();
                onStartGoogleRedirect();
              }}
              className="w-full py-3.5 px-4 bg-white hover:bg-gray-100 active:scale-[0.99] text-gray-900 font-outfit font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-3 transition border border-gray-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>

            {/* Server Environment Readiness Notice */}
            {(!serverConfig.googleAuthConfigured || !serverConfig.databaseConfigured) && (
              <div
                data-testid="backend-config-notice"
                className="p-3 bg-[#140b06] border border-[#3d2313] rounded-xl text-[11px] text-gray-400 space-y-1"
              >
                <span className="font-bold text-[#f5d061] block">
                  Cloud Environment Status:
                </span>
                <div>
                  &bull; Google OAuth:{' '}
                  <span
                    className={
                      serverConfig.googleAuthConfigured ? 'text-emerald-400' : 'text-amber-400'
                    }
                  >
                    {serverConfig.googleAuthConfigured
                      ? 'Configured'
                      : 'Awaiting GOOGLE_CLIENT_ID in server .env'}
                  </span>
                </div>
                <div>
                  &bull; Neon PostgreSQL:{' '}
                  <span
                    className={
                      serverConfig.databaseConfigured ? 'text-emerald-400' : 'text-amber-400'
                    }
                  >
                    {serverConfig.databaseConfigured
                      ? 'Configured'
                      : 'Awaiting DATABASE_URL in server .env'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* AFTER SIGN-IN VIEW */
          <div className="space-y-4">
            {/* Profile Card */}
            <div className="p-4 bg-[#24150b] border border-[#422614] rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="w-12 h-12 rounded-full border-2 border-[#d4af37] object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#3b2514] border-2 border-[#d4af37] flex items-center justify-center text-[#f5d061] flex-shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 block">
                    Signed in with Google
                  </span>
                  <h3
                    data-testid="account-display-name"
                    className="font-kalam font-bold text-xl text-white truncate"
                  >
                    {user.displayName}
                  </h3>
                  <span className="text-[11px] text-gray-400">
                    Level {progress.level} &bull; {progress.coins.toLocaleString()} Coins &bull;{' '}
                    {progress.unlockedSkins.length} Pens
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={isBusy}
                onClick={() => {
                  Sound.playClick();
                  handleAction(onSignOut);
                }}
                data-testid="signout-btn"
                className="px-3.5 py-2 bg-[#2d190e] hover:bg-[#3d2313] text-gray-200 border border-[#523018] rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 flex-shrink-0"
              >
                <LogOut className="w-4 h-4 text-amber-400" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Confirmed Account Data Deletion Workflow */}
            <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-red-300 text-xs block">
                    Delete Cloud Account & Data
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Permanently deletes your Neon cloud profile, cloud saves, match history, and
                    achievements.
                  </span>
                </div>
                {!showDeleteConfirm && (
                  <button
                    type="button"
                    data-testid="open-delete-account-btn"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-3 py-1.5 bg-red-900/50 hover:bg-red-800/70 text-red-200 border border-red-500/40 rounded-lg text-xs font-bold flex items-center gap-1 transition flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Account</span>
                  </button>
                )}
              </div>

              {showDeleteConfirm && (
                <div
                  data-testid="delete-account-confirmation"
                  className="pt-2 border-t border-red-500/20 space-y-2.5 text-xs"
                >
                  <p className="text-red-200 leading-relaxed">
                    <strong>Warning:</strong> This permanently deletes your user profile, cloud save
                    progress, match history records, and unlocked achievements from Neon PostgreSQL.
                    Local device progress will remain untouched. Type{' '}
                    <code className="px-1.5 py-0.5 bg-black/50 rounded text-red-300 font-mono">
                      DELETE
                    </code>{' '}
                    to confirm:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      data-testid="delete-account-input"
                      value={deleteConfirmInput}
                      onChange={(e) => setDeleteConfirmInput(e.target.value)}
                      placeholder="Type DELETE"
                      className="bg-[#120905] border border-red-500/50 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono outline-none flex-1"
                    />
                    <button
                      type="button"
                      data-testid="confirm-delete-account-btn"
                      disabled={deleteConfirmInput.trim() !== 'DELETE' || isBusy}
                      onClick={() => handleAction(onDeleteAccount)}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold rounded-lg transition"
                    >
                      Permanently Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmInput('');
                      }}
                      className="px-2.5 py-1.5 text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
