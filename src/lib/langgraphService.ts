// langgraphService.ts
// This file will orchestrate the LangGraph workflow, managing state and node execution.

import {
  ReportState,
  SectionState,
  ReportStateInput,
  ReportStateOutput,
  Section,
  Feedback,
} from "./langgraphState";
import {
  generateReportPlan,
  humanFeedback,
  generateQueries,
  webSearch,
  writeSection,
  gradeSection,
  shouldContinue,
  // gatherCompletedSections, // Implicitly handled
  writeFinalSections,
  compileFinalReport,
} from "./langgraphNodes";
import type { ChatOpenAI } from "@langchain/openai"; // Import type for config
import type { TavilySearchResults } from "@langchain/community/tools/tavily_search"; // Import type for config

// Define a more specific RunnableConfig for the workflow service
interface WorkflowRunnableConfig {
  llm?: ChatOpenAI;
  searchTool?: TavilySearchResults;
  report_organization?: string;
  number_of_planning_queries?: number;
  number_of_section_queries?: number;
  max_search_depth?: number;
  userId?: string; // For user-specific DB operations and Clerk context
  [key: string]: any; // Allow other dynamic properties
}

class DeepResearchWorkflow {
  private currentState: ReportState;
  private config: WorkflowRunnableConfig; // Use the more specific config type

  constructor(initialInput: ReportStateInput, config: WorkflowRunnableConfig) {
    this.currentState = {
      ...initialInput,
      sections: [],
      completed_sections: [],
      // Ensure topic is part of the initial state if not in ReportStateInput explicitly
      topic: initialInput.topic,
    };
    this.config = config; // Store the config, including userId if provided
  }

  private async executeNode(nodeFunction: Function, stateSlice?: any) {
    const stateToPass = stateSlice || this.currentState;
    // Pass the full config (including userId) to each node
    const updates = await nodeFunction(stateToPass, this.config);
    this.currentState = { ...this.currentState, ...updates };
    if (stateSlice && updates.section) {
      const sectionIndex = this.currentState.sections.findIndex(
        (s) => s.name === updates.section.name
      );
      if (sectionIndex > -1) {
        this.currentState.sections[sectionIndex] = updates.section;
      }
    }
    if (updates.completed_sections) {
      this.currentState.completed_sections = updates.completed_sections;
    }
  }

  private async executeSectionWorkflow(section: Section): Promise<Section> {
    let currentSectionState: SectionState & { feedback?: Feedback } = {
      topic: this.currentState.topic,
      section: { ...section },
      search_iterations: 0,
      search_queries: [],
      source_str: "",
      completed_sections: [],
    };

    let nextNodeInSection:
      | "generate_queries"
      | "web_search"
      | "write_section"
      | "grade_section"
      | "__end__" = "generate_queries";

    while (nextNodeInSection !== "__end__") {
      currentSectionState.search_iterations++;
      // Pass the full config (including userId) to each node call within the section workflow
      if (currentSectionState.search_iterations > (this.config.max_search_depth || 3) + 1) {
        console.warn(
          `Max search iterations reached for section: ${currentSectionState.section.name}`
        );
        break;
      }

      switch (nextNodeInSection) {
        case "generate_queries":
          const queryUpdates = await generateQueries(currentSectionState, this.config);
          currentSectionState = { ...currentSectionState, ...queryUpdates };
          nextNodeInSection = "web_search";
          break;
        case "web_search":
          const searchUpdates = await webSearch(currentSectionState, this.config);
          currentSectionState = { ...currentSectionState, ...searchUpdates };
          // If search fails to return sources and feedback indicates need for research, loop back to queries or end.
          if (
            !searchUpdates.source_str &&
            currentSectionState.feedback?.grade === "fail" &&
            currentSectionState.feedback?.follow_up_queries?.length === 0
          ) {
            console.warn(
              `No sources from webSearch for ${currentSectionState.section.name}, and no follow-up queries. Ending section.`
            );
            nextNodeInSection = "__end__";
            break;
          }
          nextNodeInSection = "write_section";
          break;
        case "write_section":
          const writeUpdates = await writeSection(currentSectionState, this.config);
          currentSectionState = { ...currentSectionState, ...writeUpdates };
          nextNodeInSection = "grade_section";
          break;
        case "grade_section":
          const feedback = await gradeSection(currentSectionState, this.config);
          currentSectionState.feedback = feedback;
          // Pass the full config to shouldContinue
          const decision = shouldContinue(
            currentSectionState as SectionState & { feedback: Feedback },
            this.config
          );
          if (decision === "__end__") {
            nextNodeInSection = "__end__";
          } else {
            // Update search_queries for the next iteration if web_search is next
            if (decision === "web_search" && feedback.follow_up_queries) {
              currentSectionState.search_queries = feedback.follow_up_queries;
            }
            nextNodeInSection = decision as "web_search" | "write_section";
          }
          break;
      }
    }
    return currentSectionState.section;
  }

  public async run(): Promise<ReportStateOutput> {
    // Ensure userId from Clerk is passed in this.config when the workflow is run
    console.log(
      `Workflow starting for topic: ${this.currentState.topic}, User: ${this.config.userId || "anonymous"}`
    );

    await this.executeNode(generateReportPlan);

    const feedbackDecision = humanFeedback(this.currentState, this.config);
    if (feedbackDecision === "generate_report_plan") {
      console.log("Re-planning based on feedback...");
      await this.executeNode(generateReportPlan);
    }

    const researchSections = this.currentState.sections.filter((s) => s.research);
    const completedResearchSections: Section[] = [];
    for (const section of researchSections) {
      console.log(`Processing research section: ${section.name}`);
      const completedSection = await this.executeSectionWorkflow(section);
      completedResearchSections.push(completedSection);
    }

    // Update original sections with completed research content
    this.currentState.sections = this.currentState.sections.map((s) => {
      const foundCompleted = completedResearchSections.find((cs) => cs.name === s.name);
      return foundCompleted || s;
    });
    this.currentState.completed_sections = this.currentState.sections.filter(
      (s) => s.content && s.content !== ""
    );

    await this.executeNode(writeFinalSections);
    await this.executeNode(compileFinalReport);

    if (!this.currentState.final_report) {
      throw new Error("Final report was not generated.");
    }
    console.log(
      `Workflow finished for topic: ${this.currentState.topic}, User: ${this.config.userId || "anonymous"}`
    );
    return { final_report: this.currentState.final_report };
  }
}

// Example Usage (conceptual - to be called from an API route in Next.js)
// import { getCurrentUser } from '@clerk/nextjs/server'; // Example for server-side user fetching
//
// export async function runDeepResearch(topic: string, reportOrganization?: string) {
//     const user = await getCurrentUser(); // Fetch user from Clerk
//     const userId = user?.id;
//
//     const initialInput: ReportStateInput = { topic };
//     const config: WorkflowRunnableConfig = {
//         userId: userId, // Pass Clerk user ID here
//         report_organization: reportOrganization,
//         // Other configurations like number_of_planning_queries etc.
//     };
//     const workflow = new DeepResearchWorkflow(initialInput, config);
//     try {
//         const result = await workflow.run();
//         console.log("Final Report:\n", result.final_report);
//         // Store result in Supabase, associated with userId
//         // if (userId && supabase) {
//         //    await supabase.from('reports').insert({ user_id: userId, topic: topic, report_content: result.final_report, created_at: new Date() });
//         // }
//         return result;
//     } catch (error) {
//         console.error("Workflow failed for user:", userId, error);
//         throw error;
//     }
// }
