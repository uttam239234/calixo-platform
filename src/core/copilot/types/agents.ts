/**
 * Calixo Platform - Copilot Agent Types
 *
 * An Agent is a named specialist the Planner routes a request to — a thin
 * grouping over Skills, never a second place that holds business logic.
 * The user never picks an Agent from a menu; it only ever surfaces as a
 * small "answered by" attribution line under a response.
 */

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
}
