// langgraphNodes.ts
// This file will contain the implementations of the various nodes in the LangGraph workflow.

import {
  ReportState,
  SectionState,
  Queries,
  Sections,
  Section,
  ReportStateInput,
  ReportStateOutput,
  SectionOutputState,
  Feedback,
  SearchQuery,
} from "./langgraphState";
import {
  getReportPlannerQueryWriterInstructions,
  getReportPlannerInstructions,
  getQueryWriterInstructions,
  sectionWriterInstructions,
  getSectionWriterInputs,
  getSectionGraderInstructions,
  getFinalSectionWriterInstructions,
} from "./langgraphPrompts";
import { ChatOpenAI } from "@langchain/openai";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { JsonOutputParser } from "@langchain/core/output_parsers";

// Import Supabase and Pinecone clients (assuming they are set up in these files)
// Actual client instances or getter functions would be exported from these.
// For example: import { supabase } from "./supabaseClient";
// import { pinecone } from "./pineconeClient";
// For now, we will use placeholder comments for where they would be used.

// Ensure API keys are loaded from .env (or similar mechanism in Next.js)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
// const SUPABASE_URL = process.env.SUPABASE_URL;
// const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
// const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
// const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT;

interface RunnableConfig {
  llm?: ChatOpenAI;
  searchTool?: TavilySearchResults;
  report_organization?: string;
  number_of_planning_queries?: number;
  number_of_section_queries?: number;
  max_search_depth?: number;
  userId?: string; // For user-specific DB operations
  [key: string]: any;
}

const getLlm = (config: RunnableConfig) => {
  if (config.llm) return config.llm;
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set in environment variables.");
  return new ChatOpenAI({ openAIApiKey: OPENAI_API_KEY, modelName: "gpt-4o", temperature: 0 });
};

const getSearchTool = (config: RunnableConfig) => {
  if (config.searchTool) return config.searchTool;
  if (!TAVILY_API_KEY) throw new Error("TAVILY_API_KEY is not set in environment variables.");
  return new TavilySearchResults({ apiKey: TAVILY_API_KEY, maxResults: 5 });
};

export async function generateReportPlan(
  state: ReportState,
  config: RunnableConfig
): Promise<Partial<ReportState>> {
  console.log("Node: generateReportPlan", state.topic, "User:", config.userId);
  const llm = getLlm(config);
  const searchTool = getSearchTool(config);
  const report_organization =
    config.report_organization || "1. Introduction, 2. Background, 3. Main Findings, 4. Conclusion";
  const numQueries = config.number_of_planning_queries || 3;

  // --- Supabase/Pinecone Integration Point (Conceptual) ---
  // if (config.userId) {
  //   // const userPreferences = await supabase.from("user_preferences").select("*").eq("user_id", config.userId).single();
  //   // if (userPreferences.data) { /* Adjust plan based on preferences */ }
  //   // const similarReports = await pinecone.query({ topK: 2, vector: [0.1, ..., 0.9], filter: { userId: config.userId, type: "report_plan_context" } });
  //   // if (similarReports.matches) { /* Add to planningContext */ }
  // }
  // --- End Integration Point ---

  const queryGenPrompt = getReportPlannerQueryWriterInstructions(
    state.topic,
    report_organization,
    numQueries
  );
  const queryParser = new JsonOutputParser<Queries>();
  const queryChain = llm.pipe(queryParser);
  const planningQueriesResult = await queryChain.invoke([new SystemMessage(queryGenPrompt)]);

  let planningContext = "";
  if (planningQueriesResult.queries && planningQueriesResult.queries.length > 0) {
    const searchResults = await Promise.all(
      planningQueriesResult.queries
        .filter((q) => q.search_query)
        .map((q) => searchTool.invoke(q.search_query!))
    );
    planningContext = searchResults
      .flat()
      .map((res: string | { content: string }) => (typeof res === "string" ? res : res.content))
      .join("\n\n");
  }

  const planPrompt = getReportPlannerInstructions(
    state.topic,
    report_organization,
    planningContext,
    state.feedback_on_report_plan
  );
  const planParser = new JsonOutputParser<Sections>();
  const planChain = llm.pipe(planParser);
  const reportPlan = await planChain.invoke([new SystemMessage(planPrompt)]);

  // --- Supabase Integration Point (Conceptual) ---
  // if (config.userId && reportPlan.sections) {
  //   // await supabase.from("report_plans").insert({ user_id: config.userId, topic: state.topic, plan: reportPlan.sections });
  // }
  // --- End Integration Point ---

  return { sections: reportPlan.sections || [], feedback_on_report_plan: undefined };
}

export function humanFeedback(
  state: ReportState,
  config: RunnableConfig
): "generate_report_plan" | "build_section_with_web_research" | string {
  console.log("Node: humanFeedback", "User:", config.userId);
  // --- Supabase Integration Point (Conceptual) ---
  // if (config.userId && state.feedback_on_report_plan) {
  //   // await supabase.from("plan_feedback").insert({ user_id: config.userId, topic: state.topic, feedback: state.feedback_on_report_plan });
  // }
  // --- End Integration Point ---
  if (
    state.feedback_on_report_plan &&
    state.feedback_on_report_plan.toLowerCase().includes("revise")
  ) {
    return "generate_report_plan";
  }
  return "build_section_with_web_research";
}

export async function generateQueries(
  state: SectionState,
  config: RunnableConfig
): Promise<Partial<SectionState>> {
  console.log(`Node: generateQueries for section: ${state.section.name}`, "User:", config.userId);
  const llm = getLlm(config);
  const numQueries = config.number_of_section_queries || 3;
  const prompt = getQueryWriterInstructions(state.topic, state.section.description, numQueries);
  const queryParser = new JsonOutputParser<Queries>();
  const queryChain = llm.pipe(queryParser);
  const result = await queryChain.invoke([new SystemMessage(prompt)]);
  return { search_queries: result.queries || [] };
}

export async function webSearch(
  state: SectionState,
  config: RunnableConfig
): Promise<Partial<SectionState>> {
  console.log(`Node: webSearch for section: ${state.section.name}`, "User:", config.userId);
  const searchTool = getSearchTool(config);
  let source_str = "";
  if (state.search_queries && state.search_queries.length > 0) {
    const searchResults = await Promise.all(
      state.search_queries
        .filter((q) => q.search_query)
        .map((q) => searchTool.invoke(q.search_query!))
    );
    source_str = searchResults
      .flat()
      .map((res: string | { url: string; content: string }, index: number) => {
        const item = typeof res === "string" ? { url: "Unknown", content: res } : res;
        // --- Pinecone Integration Point (Conceptual) ---
        // if (config.userId && item.url !== "Unknown") {
        //   // const embedding = await someEmbeddingFunction(item.content);
        //   // await pinecone.upsert([{ id: `${config.userId}-${state.topic}-${state.section.name}-${item.url}`, values: embedding, metadata: { userId: config.userId, topic: state.topic, section: state.section.name, url: item.url, contentSnippet: item.content.substring(0,500) } }]);
        // }
        // --- End Integration Point ---
        return `[${index + 1}] ${item.url}: ${item.content}`;
      })
      .join("\n\n");
  }
  return { source_str };
}

export async function writeSection(
  state: SectionState,
  config: RunnableConfig
): Promise<Partial<SectionState>> {
  console.log(`Node: writeSection for section: ${state.section.name}`, "User:", config.userId);
  const llm = getLlm(config);
  let ragContext = "";
  // --- Pinecone RAG Integration Point (Conceptual) ---
  // if (config.userId) {
  //   // const sectionQueryEmbedding = await someEmbeddingFunction(state.section.description);
  //   // const ragResults = await pinecone.query({ topK: 3, vector: sectionQueryEmbedding, filter: { userId: config.userId, topic: state.topic } });
  //   // if (ragResults.matches) { ragContext = ragResults.matches.map(m => m.metadata.contentSnippet).join("\n---\n"); }
  // }
  // --- End Integration Point ---
  const writerInput = getSectionWriterInputs(
    state.topic,
    state.section.name,
    state.section.description,
    state.section.content,
    state.source_str + (ragContext ? `\n\nRelevant context from past research:\n${ragContext}` : "")
  );
  const prompt = `${sectionWriterInstructions}\n${writerInput}`;
  const result = await llm.invoke([new SystemMessage(prompt)]);
  const updatedSection: Section = { ...state.section, content: result.content as string };
  // --- Supabase Integration Point (Conceptual) ---
  // if (config.userId) {
  //   // await supabase.from("section_drafts").upsert({ user_id: config.userId, topic: state.topic, section_name: updatedSection.name, content: updatedSection.content }, { onConflict: ["user_id", "topic", "section_name"] });
  // }
  // --- End Integration Point ---
  return { section: updatedSection };
}

export async function gradeSection(state: SectionState, config: RunnableConfig): Promise<Feedback> {
  console.log(`Node: gradeSection for section: ${state.section.name}`, "User:", config.userId);
  const llm = getLlm(config);
  const numFollowUp = 2;
  const prompt = getSectionGraderInstructions(
    state.topic,
    state.section.description,
    state.section.content,
    numFollowUp
  );
  const graderParser = new JsonOutputParser<Feedback>();
  const graderChain = llm.pipe(graderParser);
  const result = await graderChain.invoke([new SystemMessage(prompt)]);
  // --- Supabase Integration Point (Conceptual) ---
  // if (config.userId) {
  //   // await supabase.from("section_grades").insert({ user_id: config.userId, topic: state.topic, section_name: state.section.name, grade: result.grade, follow_up_queries: result.follow_up_queries });
  // }
  // --- End Integration Point ---
  return result;
}

export function shouldContinue(
  state: SectionState & { feedback: Feedback },
  config: RunnableConfig
): "web_search" | "write_section" | "__end__" {
  console.log(`Node: shouldContinue for section: ${state.section.name}`, "User:", config.userId);
  const max_search_depth = config.max_search_depth || 2;
  if (state.feedback.grade === "fail") {
    if (state.search_iterations < max_search_depth) {
      console.log("Graded as fail, needs more research or rewrite.");
      return state.feedback.follow_up_queries && state.feedback.follow_up_queries.length > 0
        ? "web_search"
        : "write_section";
    } else {
      console.log("Max search depth reached, attempting to write section anyway.");
      return "write_section";
    }
  }
  console.log("Section graded as pass.");
  return "__end__";
}

export async function writeFinalSections(
  state: ReportState,
  config: RunnableConfig
): Promise<Partial<ReportState>> {
  console.log("Node: writeFinalSections", "User:", config.userId);
  const llm = getLlm(config);
  const updatedSections = [...state.sections];
  for (let i = 0; i < updatedSections.length; i++) {
    const section = updatedSections[i];
    if (!section.research && !section.content) {
      console.log(`Writing final section: ${section.name}`);
      const contextForFinalSection = state.completed_sections
        .map((cs) => `## ${cs.name}\n${cs.content}`)
        .join("\n\n");
      const prompt = getFinalSectionWriterInstructions(
        state.topic,
        section.name,
        section.description,
        contextForFinalSection
      );
      const result = await llm.invoke([new SystemMessage(prompt)]);
      updatedSections[i] = { ...section, content: result.content as string };
    }
  }
  return { sections: updatedSections };
}

export async function compileFinalReport(
  state: ReportState,
  config: RunnableConfig
): Promise<Partial<ReportStateOutput>> {
  console.log("Node: compileFinalReport", "User:", config.userId);
  const finalReport = state.sections
    .map((s) => `## ${s.name}\n${s.content || "Content not generated."}`)
    .join("\n\n");
  // --- Supabase/Pinecone Integration Point (Conceptual) ---
  // if (config.userId) {
  //   // await supabase.from("final_reports").insert({ user_id: config.userId, topic: state.topic, report_content: finalReport });
  //   // const reportEmbedding = await someEmbeddingFunction(finalReport);
  //   // await pinecone.upsert([{ id: `${config.userId}-${state.topic}-final_report`, values: reportEmbedding, metadata: { userId: config.userId, topic: state.topic, type: "final_report" } }]);
  // }
  // --- End Integration Point ---
  return { final_report: finalReport };
}
