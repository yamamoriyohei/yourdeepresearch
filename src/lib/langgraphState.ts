// langgraphState.ts
// This file defines the state objects used in the LangGraph workflow.

// Corresponds to the Section Pydantic model in state.py
export interface Section {
  name: string;
  description: string;
  research: boolean;
  content: string;
}

// Corresponds to the Sections Pydantic model in state.py
export interface Sections {
  sections: Section[];
}

// Corresponds to the SearchQuery Pydantic model in state.py
export interface SearchQuery {
  search_query: string | null;
}

// Corresponds to the Queries Pydantic model in state.py
export interface Queries {
  queries: SearchQuery[];
}

// Corresponds to the Feedback Pydantic model in state.py
export interface Feedback {
  grade: "pass" | "fail";
  follow_up_queries: SearchQuery[];
}

// Corresponds to the ReportStateInput TypedDict in state.py
export interface ReportStateInput {
  topic: string;
}

// Corresponds to the ReportStateOutput TypedDict in state.py
export interface ReportStateOutput {
  final_report: string;
}

// Corresponds to the ReportState TypedDict in state.py
export interface ReportState {
  topic: string;
  feedback_on_report_plan?: string; // Optional as it's not always present
  sections: Section[];
  completed_sections: Section[]; // To be managed with an equivalent of operator.add
  report_sections_from_research?: string;
  final_report?: string;
}

// Corresponds to the SectionState TypedDict in state.py
export interface SectionState {
  topic: string;
  section: Section;
  search_iterations: number;
  search_queries: SearchQuery[];
  source_str: string;
  report_sections_from_research?: string;
  completed_sections: Section[]; // For Send() API
}

// Corresponds to the SectionOutputState TypedDict in state.py
export interface SectionOutputState {
  completed_sections: Section[];
}
