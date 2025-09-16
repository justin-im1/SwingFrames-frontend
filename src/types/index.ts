// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

// Swing types
export interface Swing {
  id: string;
  userId?: string;
  user_id?: string; // Backend format
  title?: string;
  description?: string;
  videoUrl?: string;
  video_url?: string; // Backend format
  file_url?: string; // Backend format
  thumbnailUrl?: string;
  tags?: SwingTag[];
  tag?: SwingTag | null; // Backend format (single tag)
  createdAt?: string;
  created_at?: string; // Backend format
  updatedAt?: string;
  updated_at?: string; // Backend format
  duration?: number;
  fileSize?: number;
}

export interface SwingTag {
  id: string;
  type: 'outcome' | 'club' | 'custom';
  value: string;
  label: string;
}

// Comparison types
export interface Comparison {
  id: string;
  userId: string;
  swings: string[]; // Swing IDs
  alignmentType: 'timestamp' | 'impact' | 'backswing_top' | 'follow_through';
  viewMode: 'side_by_side' | 'overlay';
  overlaySettings: OverlaySettings;
  createdAt: string;
}

export interface OverlaySettings {
  opacity: number;
  syncPlayback: boolean;
  showTimeline: boolean;
  highlightDifferences: boolean;
}

// Upload types
export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  uploadFields?: Record<string, string>; // New format: uploadFields object
  contentType?: string; // Fallback: individual parameters
  contentDisposition?: string; // Fallback: individual parameters
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Component prop types
export interface VideoPlayerProps {
  src: string;
  poster?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
  onTimeUpdate?: (currentTime: number) => void;
  onLoadedMetadata?: (duration: number) => void;
}

export interface SwingCardProps {
  swing: Swing;
  onSelect?: (swing: Swing) => void;
  onDelete?: (swingId: string) => void;
  isSelected?: boolean;
  showActions?: boolean;
}

// Form types
export interface UploadFormData {
  file: File;
  title: string;
  description?: string;
  tags: string[];
}

export interface TagFormData {
  type: 'outcome' | 'club' | 'custom';
  value: string;
  label: string;
}

// Redux state types
export interface RootState {
  user: UserState;
  swings: SwingsState;
  overlay: OverlayState;
  ui: UIState;
}

export interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface SwingsState {
  library: Swing[];
  selectedSwings: string[];
  currentComparison: Comparison | null;
  loading: boolean;
  error: string | null;
}

export interface OverlayState {
  settings: OverlaySettings;
  isOverlayMode: boolean;
  syncEnabled: boolean;
}

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: number;
  duration?: number;
}

// Pose Analysis types
export interface PoseSnapshot {
  setup: string;
  top_backswing: string;
  impact: string;
  follow_through: string;
}

export interface PoseAnalysis {
  swing_id: string;
  snapshots: PoseSnapshot;
  status: 'available' | 'not_generated' | 'processing' | 'failed';
  createdAt?: string;
  updatedAt?: string;
  error?: string;
}

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PoseFrame {
  landmarks: PoseLandmark[];
  timestamp: number;
  confidence: number;
}

export interface SwingEvent {
  type: 'setup' | 'top_backswing' | 'impact' | 'follow_through';
  timestamp: number;
  frameIndex: number;
  confidence: number;
}

// Pose Analysis Component Props
export interface SwingAnalysisProps {
  swingId: string;
  onAnalysisComplete?: (analysis: PoseAnalysis) => void;
  onError?: (error: string) => void;
}

export interface SnapshotGridProps {
  snapshots: PoseSnapshot;
  loading?: boolean;
  error?: string;
  onSnapshotClick?: (event: string, url: string) => void;
}

export interface PoseComparisonProps {
  swing1: PoseAnalysis;
  swing2: PoseAnalysis;
  alignmentType?: 'setup' | 'top_backswing' | 'follow_through';
}

export interface PoseVisualizationProps {
  snapshotUrl: string;
  landmarks?: PoseLandmark[];
  showLandmarks?: boolean;
  highlightPart?: string;
}
