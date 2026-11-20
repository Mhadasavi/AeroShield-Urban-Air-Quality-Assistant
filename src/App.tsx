import { useEffect, useReducer } from 'react';
import type {
  ActionResource,
  AdvisorRecommendation,
  AdvisorRequest,
  CreateResourceInput,
  VerticalId,
} from '../shared/types.ts';
import { apiClient } from './api/client.ts';
import { ActionPlanSection } from './components/ActionPlanSection.tsx';
import { AtmosphereHero } from './components/AtmosphereHero.tsx';
import { GenAiAdvisorPanel } from './components/GenAiAdvisorPanel.tsx';
import { ImpactSimulator } from './components/ImpactSimulator.tsx';
import { ResourceModal } from './components/ResourceModal.tsx';
import { TelemetryStrip } from './components/TelemetryStrip.tsx';
import { ToastRegion } from './components/ToastRegion.tsx';
import { TopNav } from './components/TopNav.tsx';
import { appReducer, initialAppState } from './state/appReducer.ts';

export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  useEffect(() => {
    let cancelled = false;
    async function loadInitial() {
      try {
        const [{ verticals }, { resources }] = await Promise.all([
          apiClient.fetchVerticals(),
          apiClient.fetchResources('family'),
        ]);
        if (!cancelled) {
          dispatch({ type: 'INIT_SUCCESS', verticals, resources });
        }
      } catch (err) {
        if (!cancelled) {
          dispatch({
            type: 'INIT_ERROR',
            message: err instanceof Error ? err.message : 'Unable to reach air quality server.',
          });
        }
      }
    }
    void loadInitial();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!state.toast) return;
    const timer = window.setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 4200);
    return () => window.clearTimeout(timer);
  }, [state.toast]);

  const activeVertical =
    state.verticals.find((v) => v.id === state.activeVerticalId) ?? state.verticals[0];

  const handleSelectVertical = async (verticalId: VerticalId) => {
    dispatch({ type: 'SELECT_VERTICAL', verticalId });
    try {
      const { resources } = await apiClient.fetchResources(verticalId);
      dispatch({ type: 'SET_RESOURCES', resources });
    } catch {
      dispatch({ type: 'SHOW_TOAST', text: 'Failed to load vertical protocols.', tone: 'error' });
    }
  };

  const handleGeneratePlan = async (payload: AdvisorRequest) => {
    dispatch({ type: 'ADVISOR_START' });
    try {
      const plan = await apiClient.generateAdvisorPlan(payload);
      dispatch({ type: 'ADVISOR_SUCCESS', plan });
      dispatch({
        type: 'SHOW_TOAST',
        text:
          plan.mode === 'ai'
            ? 'Generated personalized GenAI smog defense plan.'
            : 'Generated verified offline heuristic smog defense plan.',
        tone: plan.mode === 'ai' ? 'success' : 'info',
      });
    } catch (err) {
      dispatch({
        type: 'ADVISOR_ERROR',
        message: err instanceof Error ? err.message : 'Unable to generate advisor plan.',
      });
    }
  };

  const handleApplyRecommendation = async (rec: AdvisorRecommendation) => {
    try {
      const { resource } = await apiClient.createResource({
        verticalId: state.activeVerticalId,
        title: rec.title,
        category: rec.category,
        priority: rec.priority,
        timeWindow: rec.timeWindow,
        description: rec.actionSteps,
        impactSummary: rec.directImpact,
        pm25ReductionPct: rec.pm25ReductionPct,
        co2SavedKgPerMonth: rec.co2SavedKgPerMonth,
        costEstimate: rec.costEstimate,
        source: 'ai',
      });
      dispatch({ type: 'ADD_RESOURCE', resource });
      dispatch({ type: 'SHOW_TOAST', text: `Added "${rec.title}" to your active plan.` });
    } catch (err) {
      dispatch({
        type: 'SHOW_TOAST',
        text: err instanceof Error ? err.message : 'Could not apply recommendation.',
        tone: 'error',
      });
    }
  };

  const handleSaveModal = async (payload: CreateResourceInput) => {
    try {
      if (state.modal.type === 'edit-resource') {
        const { resource } = await apiClient.updateResource(state.modal.resource.id, payload);
        dispatch({ type: 'UPDATE_RESOURCE', resource });
        dispatch({ type: 'SHOW_TOAST', text: 'Updated air quality protocol.' });
      } else {
        const { resource } = await apiClient.createResource(payload);
        dispatch({ type: 'ADD_RESOURCE', resource });
        dispatch({ type: 'SHOW_TOAST', text: 'Created new air quality protocol.' });
      }
    } catch (err) {
      dispatch({
        type: 'SHOW_TOAST',
        text: err instanceof Error ? err.message : 'Unable to save protocol.',
        tone: 'error',
      });
    }
  };

  const handleToggleComplete = async (resource: ActionResource) => {
    try {
      const { resource: updated } = await apiClient.updateResource(resource.id, {
        completed: !resource.completed,
      });
      dispatch({ type: 'UPDATE_RESOURCE', resource: updated });
      dispatch({
        type: 'SHOW_TOAST',
        text: updated.completed
          ? `Activated "${updated.title}". Impact updated.`
          : `Paused "${updated.title}".`,
      });
    } catch {
      dispatch({ type: 'SHOW_TOAST', text: 'Could not update protocol state.', tone: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteResource(id);
      dispatch({ type: 'REMOVE_RESOURCE', id });
      dispatch({ type: 'SHOW_TOAST', text: 'Removed protocol from plan.', tone: 'info' });
    } catch {
      dispatch({ type: 'SHOW_TOAST', text: 'Could not delete protocol.', tone: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd]">
      <TopNav onOpenCreate={() => dispatch({ type: 'OPEN_CREATE_MODAL' })} />

      <main id="main-content" className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
        {state.loadingInitial && (
          <div className="space-y-4" aria-busy="true" aria-label="Loading air quality workspace">
            <div className="h-12 w-64 animate-pulse rounded-xl bg-[#171f33]" />
            <div className="h-72 w-full animate-pulse rounded-2xl bg-[#171f33]" />
          </div>
        )}

        {state.errorBanner && (
          <div
            role="alert"
            className="rounded-xl border border-[#e11d48]/50 bg-[#1e293b] p-4 text-sm text-[#ffdada]"
          >
            {state.errorBanner}
          </div>
        )}

        {!state.loadingInitial && activeVertical && (
          <>
            <AtmosphereHero
              verticals={state.verticals}
              activeVertical={activeVertical}
              maskOverrides={state.shieldOverrides}
              onSelectVertical={(id) => void handleSelectVertical(id)}
              onChangeMask={(memberId, maskGrade) =>
                dispatch({ type: 'SET_SHIELD_MASK', memberId, maskGrade })
              }
            />

            <TelemetryStrip metrics={activeVertical.metrics} />

            <GenAiAdvisorPanel
              activeVertical={activeVertical}
              loading={state.advisorLoading}
              plan={state.advisorPlan}
              onGenerate={handleGeneratePlan}
              onApplyRecommendation={handleApplyRecommendation}
              onNotify={(text, tone) => dispatch({ type: 'SHOW_TOAST', text, tone })}
            />

            <ActionPlanSection
              resources={state.resources}
              categoryFilter={state.categoryFilter}
              searchQuery={state.searchQuery}
              onCategoryChange={(filter) => dispatch({ type: 'SET_CATEGORY_FILTER', filter })}
              onSearchChange={(query) => dispatch({ type: 'SET_SEARCH_QUERY', query })}
              onToggleComplete={handleToggleComplete}
              onEdit={(resource) => dispatch({ type: 'OPEN_EDIT_MODAL', resource })}
              onDelete={handleDelete}
              onOpenCreate={() => dispatch({ type: 'OPEN_CREATE_MODAL' })}
            />

            <ImpactSimulator key={activeVertical.id} defaultPm25={activeVertical.pm25} />
          </>
        )}
      </main>

      <footer className="mt-12 border-t border-white/10 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-[#87948b] sm:flex-row sm:px-6 lg:px-8">
          <span>AeroShield · Atmospheric Intelligence for Families &amp; Communities</span>
          <span>WHO PM2.5 24-hr Reference: 15 µg/m³ · US EPA Breakpoints</span>
        </div>
      </footer>

      <ResourceModal
        open={state.modal.type !== 'closed'}
        mode={state.modal.type === 'edit-resource' ? 'edit' : 'create'}
        verticalId={state.activeVerticalId}
        initial={state.modal.type === 'edit-resource' ? state.modal.resource : undefined}
        onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
        onSubmit={handleSaveModal}
      />

      <ToastRegion toast={state.toast} onDismiss={() => dispatch({ type: 'CLEAR_TOAST' })} />
    </div>
  );
}
