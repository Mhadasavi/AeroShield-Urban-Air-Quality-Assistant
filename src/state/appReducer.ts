import type {
  ActionResource,
  AdvisorPlanResponse,
  DomainVertical,
  ResourceCategory,
  ShieldMember,
  VerticalId,
} from '../../shared/types.ts';

export type ModalState =
  | { type: 'closed' }
  | { type: 'create-resource' }
  | { type: 'edit-resource'; resource: ActionResource };

export interface ToastMessage {
  id: string;
  text: string;
  tone: 'success' | 'info' | 'error';
}

export interface AppState {
  verticals: DomainVertical[];
  activeVerticalId: VerticalId;
  resources: ActionResource[];
  shieldOverrides: Record<string, ShieldMember['maskGrade']>;
  categoryFilter: 'all' | ResourceCategory;
  searchQuery: string;
  loadingInitial: boolean;
  errorBanner: string | null;
  advisorLoading: boolean;
  advisorPlan: AdvisorPlanResponse | null;
  modal: ModalState;
  toast: ToastMessage | null;
}

export type AppAction =
  | { type: 'INIT_SUCCESS'; verticals: DomainVertical[]; resources: ActionResource[] }
  | { type: 'INIT_ERROR'; message: string }
  | { type: 'SELECT_VERTICAL'; verticalId: VerticalId }
  | { type: 'SET_RESOURCES'; resources: ActionResource[] }
  | { type: 'ADD_RESOURCE'; resource: ActionResource }
  | { type: 'UPDATE_RESOURCE'; resource: ActionResource }
  | { type: 'REMOVE_RESOURCE'; id: string }
  | { type: 'SET_SHIELD_MASK'; memberId: string; maskGrade: ShieldMember['maskGrade'] }
  | { type: 'SET_CATEGORY_FILTER'; filter: 'all' | ResourceCategory }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'OPEN_CREATE_MODAL' }
  | { type: 'OPEN_EDIT_MODAL'; resource: ActionResource }
  | { type: 'CLOSE_MODAL' }
  | { type: 'ADVISOR_START' }
  | { type: 'ADVISOR_SUCCESS'; plan: AdvisorPlanResponse }
  | { type: 'ADVISOR_ERROR'; message: string }
  | { type: 'SHOW_TOAST'; text: string; tone?: ToastMessage['tone'] }
  | { type: 'CLEAR_TOAST' };

export const initialAppState: AppState = {
  verticals: [],
  activeVerticalId: 'family',
  resources: [],
  shieldOverrides: {},
  categoryFilter: 'all',
  searchQuery: '',
  loadingInitial: true,
  errorBanner: null,
  advisorLoading: false,
  advisorPlan: null,
  modal: { type: 'closed' },
  toast: null,
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'INIT_SUCCESS':
      return {
        ...state,
        verticals: action.verticals,
        resources: action.resources,
        loadingInitial: false,
        errorBanner: null,
      };
    case 'INIT_ERROR':
      return { ...state, loadingInitial: false, errorBanner: action.message };
    case 'SELECT_VERTICAL':
      return {
        ...state,
        activeVerticalId: action.verticalId,
        categoryFilter: 'all',
        searchQuery: '',
        advisorPlan: null,
      };
    case 'SET_RESOURCES':
      return { ...state, resources: action.resources };
    case 'ADD_RESOURCE':
      return { ...state, resources: [action.resource, ...state.resources] };
    case 'UPDATE_RESOURCE':
      return {
        ...state,
        resources: state.resources.map((r) => (r.id === action.resource.id ? action.resource : r)),
      };
    case 'REMOVE_RESOURCE':
      return {
        ...state,
        resources: state.resources.filter((r) => r.id !== action.id),
      };
    case 'SET_SHIELD_MASK':
      return {
        ...state,
        shieldOverrides: { ...state.shieldOverrides, [action.memberId]: action.maskGrade },
      };
    case 'SET_CATEGORY_FILTER':
      return { ...state, categoryFilter: action.filter };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.query };
    case 'OPEN_CREATE_MODAL':
      return { ...state, modal: { type: 'create-resource' } };
    case 'OPEN_EDIT_MODAL':
      return { ...state, modal: { type: 'edit-resource', resource: action.resource } };
    case 'CLOSE_MODAL':
      return { ...state, modal: { type: 'closed' } };
    case 'ADVISOR_START':
      return { ...state, advisorLoading: true };
    case 'ADVISOR_SUCCESS':
      return { ...state, advisorLoading: false, advisorPlan: action.plan };
    case 'ADVISOR_ERROR':
      return {
        ...state,
        advisorLoading: false,
        toast: { id: String(Date.now()), text: action.message, tone: 'error' },
      };
    case 'SHOW_TOAST':
      return {
        ...state,
        toast: { id: String(Date.now()), text: action.text, tone: action.tone ?? 'success' },
      };
    case 'CLEAR_TOAST':
      return { ...state, toast: null };
    default:
      return state;
  }
}
