# FEATURE SPEC: Automations

**What:** IF/THEN workflow automation system for triggering actions based on client events and conditions
**Who:** Agency Admins and Account Managers setting up automated workflows to reduce manual tasks
**Why:** Eliminate repetitive work, ensure consistent processes, enable proactive client management at scale
**Status:** 🏗️ In Progress (28/40 tasks complete)

---

## User Stories

**US-033: View Automations Dashboard**
As an Admin, I want to see all automations and their status, so I can manage workflows.

Acceptance Criteria:
- [x] List with: name, status (active/paused), last run, success rate
- [x] Quick toggle to enable/disable
- [x] View run history with success/failure
- [ ] Badge for failed runs requiring attention

**US-034: Create IF/THEN Automation**
As an Admin, I want to create automations with triggers and actions, so I automate tasks.

Acceptance Criteria:
- [x] Maximum 2 triggers (AND logic)
- [x] Unlimited chained actions
- [x] Conditional branching: IF/THEN/ELSE
- [x] Delayed actions: 0 min to 24 hours
- [ ] Preview mode: test without executing

**US-035: Configure Triggers**
As an Admin, I want various trigger types, so automations respond to different events.

Acceptance Criteria:
- [x] Stage change: Client moves to specific stage
- [x] Inactivity: No activity for X days
- [x] KPI threshold: Metric crosses value
- [x] New message: Slack/Gmail received
- [x] Ticket created: New support ticket
- [x] Scheduled: Run at specific time/day

**US-036: Configure Actions**
As an Admin, I want various action types, so automations perform useful tasks.

Acceptance Criteria:
- [x] Create task: Add task to client
- [x] Send notification: Internal Slack/email
- [x] Draft communication: Queue AI-drafted message
- [x] Create ticket: Open support ticket
- [x] Update client: Change stage, health, assignee
- [x] Add alert: Create Intelligence Center alert

**US-037: Monitor Automation Runs**
As an Admin, I want to see automation history, so I can troubleshoot issues.

Acceptance Criteria:
- [x] Run history table with filtering
- [x] Details: trigger event, actions executed, errors
- [ ] Retry button for failed runs
- [ ] Approval queue for actions requiring review

---

## Functional Requirements

What this feature DOES:
- [ ] Define complex trigger conditions with AND logic for multiple criteria
- [ ] Execute action chains with conditional branching and delay scheduling
- [ ] Support human approval queues for sensitive automated actions
- [ ] Log comprehensive execution history with detailed error reporting
- [ ] Handle failure recovery with intelligent retry mechanisms
- [ ] Enable real-time monitoring and performance analytics
- [ ] Prevent automation loops with cycle detection algorithms
- [ ] Support scheduled triggers with cron-like precision
- [ ] Provide test mode for safe automation development
- [ ] Scale to handle hundreds of workflows across multiple tenants

What this feature does NOT do:
- ❌ Provide visual drag-drop workflow canvas (form-based configuration only)
- ❌ Support complex branching beyond IF/THEN/ELSE patterns
- ❌ Integrate with external automation platforms (Zapier, Make.com)
- ❌ Execute autonomous actions without comprehensive audit trails
- ❌ Support real-time triggers (minimum 1-minute intervals)

---

## Data Model

Entities involved:
- WORKFLOW - Core automation definition with triggers and action chains
- WORKFLOW_RUN - Execution history and state tracking
- CLIENT - Trigger context and action targets
- USER - Automation authorship and approval workflows

New fields needed:
| Entity | Field | Type | Description |
|--------|-------|------|-------------|
| WORKFLOW | run_count | Integer | Total execution counter |
| WORKFLOW | success_count | Integer | Successful execution counter |
| WORKFLOW | requires_approval | Boolean | Human approval requirement flag |

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|------------|
| `/api/v1/workflows` | GET | List automations with filtering and pagination |
| `/api/v1/workflows` | POST | Create new automation with validation |
| `/api/v1/workflows/{id}` | GET | Get automation details with trigger/action config |
| `/api/v1/workflows/{id}` | PATCH | Update automation configuration |
| `/api/v1/workflows/{id}` | DELETE | Soft-delete automation and cancel pending runs |
| `/api/v1/workflows/{id}/toggle` | PATCH | Enable/disable automation |
| `/api/v1/workflows/{id}/test` | POST | Preview mode test execution |
| `/api/v1/workflows/{id}/runs` | GET | Execution history with filtering |
| `/api/v1/workflows/runs/{runId}` | GET | Detailed run information with logs |
| `/api/v1/workflows/runs/{runId}/retry` | POST | Retry failed automation run |
| `/api/v1/workflows/runs/{runId}/approve` | POST | Approve pending action |
| `/api/v1/workflows/runs/{runId}/reject` | POST | Reject pending action |
| `/api/v1/workflows/triggers/types` | GET | Available trigger types with schemas |
| `/api/v1/workflows/actions/types` | GET | Available action types with schemas |
| `/api/v1/workflows/analytics` | GET | Automation performance metrics |

---

## UI Components

| Component | Purpose |
|-----------|---------|
| AutomationsDashboard | Main interface with automation list and analytics |
| AutomationCard | Individual automation summary with controls |
| AutomationBuilder | Step-by-step automation creation wizard |
| TriggerConfiguration | Trigger type selection and parameter setup |
| ActionChainEditor | Visual action sequence builder with conditions |
| ActionConfiguration | Individual action parameter configuration |
| ConditionalLogicEditor | IF/THEN/ELSE logic builder with visual flow |
| ScheduleBuilder | Cron expression builder with human-readable preview |
| ExecutionHistory | Detailed run history table with filtering |
| RunDetailsModal | Complete execution log with timeline visualization |
| ApprovalQueue | Pending action review interface |
| PerformanceAnalytics | Automation success metrics and trends |
| TestRunner | Preview mode execution with step-by-step output |
| AutomationTemplates | Pre-built automation templates library |

---

## Implementation Tasks

### Core Infrastructure
- [x] TASK-001: Set up workflow execution engine with queue processing
- [ ] TASK-002: Create trigger event detection system with real-time monitoring
- [x] TASK-003: Build action execution framework with error handling
- [x] TASK-004: Implement workflow scheduling system with cron support
- [x] TASK-005: Create approval workflow system with timeout handling

### Automation Builder
- [x] TASK-006: Build AutomationsDashboard with performance metrics
- [x] TASK-007: Create AutomationBuilder wizard with step validation
- [x] TASK-008: Implement TriggerConfiguration with dynamic forms
- [x] TASK-009: Build ActionChainEditor with drag-drop reordering
- [ ] TASK-010: Create ConditionalLogicEditor with visual flow

### Trigger System
- [x] TASK-011: Implement stage change trigger with event listening
- [x] TASK-012: Build inactivity detection with configurable thresholds
- [x] TASK-013: Create KPI threshold monitoring with alerting
- [x] TASK-014: Implement communication trigger with message parsing
- [x] TASK-015: Build ticket creation trigger with category filtering
- [x] TASK-016: Create scheduled trigger system with timezone support

### Action Framework
- [x] TASK-017: Implement task creation action with template support
- [x] TASK-018: Build notification system with multi-channel delivery
- [x] TASK-019: Create AI-powered communication drafting action
- [x] TASK-020: Implement ticket creation action with priority rules
- [x] TASK-021: Build client update action with field validation
- [x] TASK-022: Create alert generation action with severity mapping

### Execution Engine
- [x] TASK-023: Build workflow execution queue with priority handling
- [x] TASK-024: Implement delay scheduling with precise timing
- [x] TASK-025: Create conditional execution engine with complex logic
- [ ] TASK-026: Build retry mechanism with exponential backoff
- [x] TASK-027: Implement execution logging with detailed traces

### Monitoring & Analytics
- [x] TASK-028: Create ExecutionHistory with advanced filtering
- [ ] TASK-029: Build RunDetailsModal with timeline visualization
- [ ] TASK-030: Implement ApprovalQueue with notification system
- [ ] TASK-031: Create PerformanceAnalytics with trend analysis
- [ ] TASK-032: Build automation health monitoring with alerts

### Safety & Security
- [ ] TASK-033: Implement loop detection and prevention system
- [ ] TASK-034: Create rate limiting with per-agency quotas
- [x] TASK-035: Build audit logging with comprehensive tracking
- [ ] TASK-036: Implement permission validation for all actions
- [ ] TASK-037: Create test mode with isolated execution environment

### Templates & Documentation
- [ ] TASK-038: Build automation templates library with categories
- [ ] TASK-039: Create interactive help system with examples
- [ ] TASK-040: Implement automation sharing between agencies (optional)

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Trigger fires for deleted client | Log as skipped, increment skip counter, no error |
| Action fails mid-chain | Halt execution, log failure point, enable retry from failed step |
| Automation creates infinite loop | Detect cycle via execution history, pause automation, alert admin |
| Delayed action for disabled automation | Cancel scheduled execution, log cancellation reason |
| Approval timeout exceeds 24 hours | Auto-reject with notification, log timeout event |
| Multiple triggers fire simultaneously | Deduplicate by client+automation, process single instance |
| Database connection lost during execution | Queue for retry, maintain execution state consistency |
| Large action chain (50+ actions) | Warn during creation, implement chunked execution |
| Client data changes during execution | Use snapshot data from trigger time for consistency |
| Automation deleted with pending runs | Cancel pending executions, preserve history for audit |

---

## Technical Implementation

### Workflow Execution Engine
```typescript
interface WorkflowExecutionContext {
  workflowId: string;
  runId: string;
  triggerData: any;
  clientSnapshot: Client;
  agencyId: string;
  userId: string;
}

class WorkflowEngine {
  async executeWorkflow(context: WorkflowExecutionContext): Promise<ExecutionResult> {
    const workflow = await this.getWorkflow(context.workflowId);
    const run = await this.createWorkflowRun(context);

    try {
      // Validate triggers are still met
      const triggerValidation = await this.validateTriggers(workflow.triggers, context);
      if (!triggerValidation.valid) {
        return this.completeRun(run.id, 'skipped', 'Trigger conditions no longer met');
      }

      // Execute action chain
      const results = await this.executeActionChain(workflow.actions, context);

      // Update run status
      return this.completeRun(run.id, 'completed', null, results);

    } catch (error) {
      await this.handleExecutionError(run.id, error);
      throw error;
    }
  }

  async executeActionChain(actions: WorkflowAction[], context: WorkflowExecutionContext): Promise<ActionResult[]> {
    const results: ActionResult[] = [];

    for (const action of actions) {
      // Check delay
      if (action.delay_minutes > 0) {
        await this.scheduleDelayedAction(action, context, action.delay_minutes);
        continue;
      }

      // Evaluate conditional logic
      if (action.condition && !(await this.evaluateCondition(action.condition, context))) {
        results.push({ action: action.type, status: 'skipped', reason: 'Condition not met' });
        continue;
      }

      // Execute action
      try {
        const result = await this.executeAction(action, context);
        results.push(result);
      } catch (error) {
        results.push({ action: action.type, status: 'failed', error: error.message });

        // Stop chain on failure unless configured to continue
        if (!action.continue_on_failure) {
          break;
        }
      }
    }

    return results;
  }

  private async executeAction(action: WorkflowAction, context: WorkflowExecutionContext): Promise<ActionResult> {
    const actionExecutor = this.getActionExecutor(action.type);

    // Check if action requires approval
    if (action.requires_approval) {
      return this.queueForApproval(action, context);
    }

    return actionExecutor.execute(action.config, context);
  }
}
```

### Trigger Detection System
```typescript
interface TriggerDetector {
  type: string;
  detect(config: TriggerConfig, context: ClientContext): Promise<boolean>;
}

class StageChangeTriggerDetector implements TriggerDetector {
  type = 'stage_change';

  async detect(config: StageChangeTriggerConfig, context: ClientContext): Promise<boolean> {
    const { fromStage, toStage } = config;

    // Listen for stage change events via database triggers
    const recentStageChange = await supabase
      .from('stage_events')
      .select('*')
      .eq('client_id', context.clientId)
      .eq('to_stage', toStage)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
      .order('created_at', { ascending: false })
      .limit(1);

    if (!recentStageChange.data?.length) return false;

    // Check if from_stage matches (if specified)
    if (fromStage && recentStageChange.data[0].from_stage !== fromStage) {
      return false;
    }

    return true;
  }
}

class InactivityTriggerDetector implements TriggerDetector {
  type = 'inactivity';

  async detect(config: InactivityTriggerConfig, context: ClientContext): Promise<boolean> {
    const { days } = config;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Check for any recent activity
    const [recentComms, recentTasks, recentTickets] = await Promise.all([
      this.getRecentCommunications(context.clientId, cutoffDate),
      this.getRecentTasks(context.clientId, cutoffDate),
      this.getRecentTickets(context.clientId, cutoffDate)
    ]);

    // Return true if NO recent activity found
    return recentComms.length === 0 && recentTasks.length === 0 && recentTickets.length === 0;
  }

  private async getRecentCommunications(clientId: string, since: Date) {
    const { data } = await supabase
      .from('communications')
      .select('id')
      .eq('client_id', clientId)
      .gte('received_at', since.toISOString());

    return data || [];
  }
}

class KPIThresholdTriggerDetector implements TriggerDetector {
  type = 'kpi_threshold';

  async detect(config: KPIThresholdTriggerConfig, context: ClientContext): Promise<boolean> {
    const { metric, operator, value } = config;

    // Get latest client KPI data
    const clientMetrics = await this.getClientMetrics(context.clientId);
    const currentValue = clientMetrics[metric];

    if (currentValue === undefined) return false;

    // Evaluate threshold condition
    switch (operator) {
      case 'above':
        return currentValue > value;
      case 'below':
        return currentValue < value;
      case 'equals':
        return Math.abs(currentValue - value) < 0.01; // Float comparison
      default:
        return false;
    }
  }
}
```

### Action Execution Framework
```typescript
interface ActionExecutor {
  type: string;
  execute(config: ActionConfig, context: WorkflowExecutionContext): Promise<ActionResult>;
}

class CreateTaskActionExecutor implements ActionExecutor {
  type = 'create_task';

  async execute(config: CreateTaskActionConfig, context: WorkflowExecutionContext): Promise<ActionResult> {
    const { title, description, priority, dueDate } = config;

    // Create task with template variable substitution
    const processedTitle = this.substituteVariables(title, context);
    const processedDescription = this.substituteVariables(description, context);

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        client_id: context.clientSnapshot.id,
        title: processedTitle,
        description: processedDescription,
        priority,
        due_date: dueDate,
        created_by: context.userId,
        agency_id: context.agencyId
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create task: ${error.message}`);
    }

    return {
      action: this.type,
      status: 'completed',
      result: { taskId: data.id, title: processedTitle }
    };
  }

  private substituteVariables(template: string, context: WorkflowExecutionContext): string {
    return template
      .replace('{{client.name}}', context.clientSnapshot.name)
      .replace('{{client.stage}}', context.clientSnapshot.stage)
      .replace('{{client.health}}', context.clientSnapshot.health_status)
      .replace('{{trigger.date}}', new Date().toISOString().split('T')[0]);
  }
}

class SendNotificationActionExecutor implements ActionExecutor {
  type = 'send_notification';

  async execute(config: SendNotificationActionConfig, context: WorkflowExecutionContext): Promise<ActionResult> {
    const { channel, message, recipients } = config;

    const processedMessage = this.substituteVariables(message, context);

    switch (channel) {
      case 'slack':
        return this.sendSlackNotification(processedMessage, recipients, context);
      case 'email':
        return this.sendEmailNotification(processedMessage, recipients, context);
      default:
        throw new Error(`Unsupported notification channel: ${channel}`);
    }
  }

  private async sendSlackNotification(message: string, recipients: string[], context: WorkflowExecutionContext) {
    // Get Slack integration for agency
    const integration = await this.getSlackIntegration(context.agencyId);
    if (!integration) {
      throw new Error('Slack integration not configured');
    }

    // Send to specified channel or DM
    await this.slackClient.postMessage({
      token: integration.access_token,
      channel: recipients[0], // Slack channel ID
      text: message,
      username: 'AudienceOS Automation'
    });

    return {
      action: this.type,
      status: 'completed',
      result: { channel: recipients[0], message }
    };
  }
}

class DraftCommunicationActionExecutor implements ActionExecutor {
  type = 'draft_communication';

  async execute(config: DraftCommunicationActionConfig, context: WorkflowExecutionContext): Promise<ActionResult> {
    const { template, tone, platform } = config;

    // Use AI to generate context-aware draft
    const prompt = `
      Client: ${context.clientSnapshot.name}
      Stage: ${context.clientSnapshot.stage}
      Health: ${context.clientSnapshot.health_status}
      Trigger: ${JSON.stringify(context.triggerData)}

      Template: ${template}

      Generate a ${tone} ${platform} message based on the template and client context.
    `;

    const aiResponse = await this.aiService.generateText(prompt);

    // Queue draft for review
    const { data } = await supabase
      .from('communication_drafts')
      .insert({
        client_id: context.clientSnapshot.id,
        platform,
        content: aiResponse.text,
        context: context.triggerData,
        created_by: 'automation',
        agency_id: context.agencyId
      })
      .select()
      .single();

    return {
      action: this.type,
      status: 'completed',
      result: { draftId: data.id, preview: aiResponse.text.slice(0, 100) + '...' }
    };
  }
}
```

### Conditional Logic Engine
```typescript
interface ConditionEvaluator {
  evaluateCondition(condition: WorkflowCondition, context: WorkflowExecutionContext): Promise<boolean>;
}

class ConditionEngine implements ConditionEvaluator {
  async evaluateCondition(condition: WorkflowCondition, context: WorkflowExecutionContext): Promise<boolean> {
    const { field, operator, value, type } = condition;

    // Get field value from context
    const fieldValue = await this.getFieldValue(field, context);

    switch (type || 'comparison') {
      case 'comparison':
        return this.evaluateComparison(fieldValue, operator, value);
      case 'existence':
        return this.evaluateExistence(fieldValue, operator);
      case 'range':
        return this.evaluateRange(fieldValue, operator, value);
      default:
        throw new Error(`Unsupported condition type: ${type}`);
    }
  }

  private async getFieldValue(field: string, context: WorkflowExecutionContext): Promise<any> {
    const parts = field.split('.');

    switch (parts[0]) {
      case 'client':
        return this.getClientField(parts.slice(1), context.clientSnapshot);
      case 'trigger':
        return this.getTriggerField(parts.slice(1), context.triggerData);
      case 'metrics':
        return this.getMetricsField(parts.slice(1), context.clientSnapshot.id);
      case 'time':
        return this.getTimeField(parts.slice(1));
      default:
        throw new Error(`Unsupported field path: ${field}`);
    }
  }

  private evaluateComparison(fieldValue: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === expectedValue;
      case 'not_equals':
        return fieldValue !== expectedValue;
      case 'greater_than':
        return Number(fieldValue) > Number(expectedValue);
      case 'less_than':
        return Number(fieldValue) < Number(expectedValue);
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(expectedValue).toLowerCase());
      case 'starts_with':
        return String(fieldValue).toLowerCase().startsWith(String(expectedValue).toLowerCase());
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }
}
```

### Approval Workflow System
```typescript
interface ApprovalQueue {
  queueAction(action: WorkflowAction, context: WorkflowExecutionContext): Promise<ApprovalRequest>;
  approveAction(approvalId: string, userId: string): Promise<ActionResult>;
  rejectAction(approvalId: string, userId: string, reason: string): Promise<void>;
}

class ApprovalWorkflowService implements ApprovalQueue {
  async queueAction(action: WorkflowAction, context: WorkflowExecutionContext): Promise<ApprovalRequest> {
    const { data } = await supabase
      .from('workflow_approvals')
      .insert({
        workflow_run_id: context.runId,
        action_type: action.type,
        action_config: action.config,
        client_id: context.clientSnapshot.id,
        status: 'pending',
        requested_by: context.userId,
        agency_id: context.agencyId,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h expiry
      })
      .select()
      .single();

    // Send notification to admins
    await this.notifyAdminsOfPendingApproval(data, context);

    return data;
  }

  async approveAction(approvalId: string, userId: string): Promise<ActionResult> {
    // Update approval status
    const { data: approval } = await supabase
      .from('workflow_approvals')
      .update({
        status: 'approved',
        approved_by: userId,
        approved_at: new Date().toISOString()
      })
      .eq('id', approvalId)
      .select()
      .single();

    if (!approval) {
      throw new Error('Approval request not found');
    }

    // Execute the approved action
    const actionExecutor = this.getActionExecutor(approval.action_type);
    const context = await this.reconstructExecutionContext(approval.workflow_run_id);

    return actionExecutor.execute(approval.action_config, context);
  }

  async rejectAction(approvalId: string, userId: string, reason: string): Promise<void> {
    await supabase
      .from('workflow_approvals')
      .update({
        status: 'rejected',
        rejected_by: userId,
        rejected_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq('id', approvalId);

    // Update workflow run status
    await this.markWorkflowRunAsRejected(approvalId, reason);
  }

  private async notifyAdminsOfPendingApproval(approval: ApprovalRequest, context: WorkflowExecutionContext) {
    const admins = await this.getAgencyAdmins(context.agencyId);

    const notificationPromises = admins.map(admin =>
      this.sendNotification({
        userId: admin.id,
        type: 'approval_required',
        title: 'Automation Approval Required',
        message: `Action "${approval.action_type}" for ${context.clientSnapshot.name} requires approval`,
        metadata: { approvalId: approval.id, workflowRunId: context.runId }
      })
    );

    await Promise.all(notificationPromises);
  }
}
```

---

## Testing Checklist

- [ ] Happy path: Create automation with 2 triggers and 3 actions executes correctly
- [ ] Trigger validation: All trigger types detect events accurately
- [ ] Action execution: All action types complete successfully with proper error handling
- [ ] Conditional logic: IF/THEN/ELSE branches execute based on conditions
- [ ] Delayed actions: Actions execute at correct time with proper scheduling
- [ ] Approval workflow: Actions requiring approval queue correctly and process approvals
- [ ] Loop prevention: Infinite loop detection prevents runaway executions
- [ ] Error recovery: Failed actions retry appropriately with backoff
- [ ] Performance: System handles 100+ concurrent workflow executions
- [ ] Multi-tenancy: Agency isolation prevents cross-tenant data access
- [ ] Rate limiting: Per-agency execution limits enforce properly
- [ ] Test mode: Preview executions show results without side effects
- [ ] Analytics: Execution metrics track accurately for reporting
- [ ] Mobile experience: Approval queue and monitoring work on mobile
- [ ] Security: All automation actions validate permissions properly

---

## Performance Considerations

### Execution Scaling
- Use queue-based architecture with worker processes for scalability
- Implement execution priority levels for urgent vs. routine automations
- Cache trigger evaluation results to reduce database load
- Use background jobs for delayed action scheduling

### Database Optimization
```sql
-- Essential indexes for automation performance
CREATE INDEX idx_workflows_agency_active ON workflows(agency_id, is_active, updated_at DESC);
CREATE INDEX idx_workflow_runs_workflow ON workflow_runs(workflow_id, started_at DESC);
CREATE INDEX idx_workflow_runs_status ON workflow_runs(agency_id, status, started_at DESC);
CREATE INDEX idx_workflow_approvals_pending ON workflow_approvals(agency_id, status, created_at) WHERE status = 'pending';
```

### Memory Management
- Implement execution context cleanup after workflow completion
- Use streaming for large execution logs and history
- Cache frequently accessed workflow configurations
- Implement garbage collection for old workflow runs

---

## Dependencies

### Required for Implementation
- Bull or similar job queue (delayed execution)
- Cron parser library (scheduled triggers)
- JSON Schema validation (configuration validation)
- Rate limiting library (execution quotas)

### Blocked By
- WORKFLOW and WORKFLOW_RUN tables with indexes
- Event system for trigger detection
- Notification service for approvals and alerts
- AI service for communication drafting

### Enables
- Dashboard Overview (automation metrics)
- AI Intelligence Layer (automated response triggers)
- Support Tickets (auto-ticket creation)
- Client Management (automated status updates)

---

## Security & Privacy

### Execution Security
- All automation actions validate user permissions before execution
- Workflow configurations encrypted at rest for sensitive data
- Execution logs sanitized to prevent sensitive data exposure
- Rate limiting prevents abuse and resource exhaustion

### Audit Requirements
```typescript
interface AutomationAuditEvent {
  id: string;
  workflow_id: string;
  event_type: 'created' | 'executed' | 'approved' | 'failed' | 'disabled';
  actor_user_id: string;
  affected_client_id?: string;
  action_details: any;
  timestamp: string;
}

async function logAutomationEvent(event: Omit<AutomationAuditEvent, 'id' | 'timestamp'>) {
  await supabase
    .from('automation_audit_log')
    .insert({
      ...event,
      timestamp: new Date().toISOString()
    });
}
```

### Data Protection
- Client data used in trigger evaluation is never stored long-term
- Action configurations support variable templating to avoid hardcoded PII
- Approval queues automatically expire to prevent data retention issues
- Workflow execution contexts are purged after configurable retention period

---

## Success Metrics

- **Adoption Rate:** 75% of agencies create at least 5 active automations
- **Execution Reliability:** 98% of automation runs complete successfully
- **Time Savings:** 6+ hours/week saved per Account Manager through automation
- **Proactive Actions:** 40% of client interventions triggered by automated workflows
- **Approval Efficiency:** 90% of approval requests processed within 4 hours
- **Error Rate:** <2% of executions result in unrecoverable failures

---

## Monitoring & Alerts

### Key Metrics to Track
- Workflow execution success/failure rates by type
- Average execution time and queue depth
- Approval queue wait times and response rates
- Trigger detection accuracy and false positive rates
- Resource utilization and scaling requirements

### Alerting Rules
```yaml
execution_failures:
  condition: failed_execution_rate > 5%
  window: 15m
  alert: Slack

queue_backlog:
  condition: pending_executions > 100
  window: 5m
  alert: PagerDuty

approval_delays:
  condition: avg(approval_wait_time) > 6h
  window: 1h
  alert: Email

resource_usage:
  condition: cpu_usage > 80%
  window: 10m
  alert: Dashboard
```

---

## Changelog

| Date | Change |
|------|--------|
| 2025-12-31 | Enhanced spec with complete implementation details, corrected user story numbers |
| 2025-12-31 | Created initial spec from MVP-PRD |

---

*Living Document - Located at features/automations.md*