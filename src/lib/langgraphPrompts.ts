// langgraphPrompts.ts
// This file contains the prompt templates used in the LangGraph workflow.

// Corresponds to report_planner_query_writer_instructions
export const getReportPlannerQueryWriterInstructions = (
  topic: string,
  report_organization: string,
  number_of_queries: number
): string =>
  `You are performing research for a report. <Report topic> ${topic} </Report topic> <Report organization> ${report_organization} </Report organization> <Task> Your goal is to generate ${number_of_queries} web search queries that will help gather information for planning the report sections. The queries should: 1. Be related to the Report topic 2. Help satisfy the requirements specified in the report organization Make the queries specific enough to find high-quality, relevant sources while covering the breadth needed for the report structure. </Task> <Format> Call the Queries tool </Format> `;

// Corresponds to report_planner_instructions
export const getReportPlannerInstructions = (
  topic: string,
  report_organization: string,
  context: string,
  feedback: string | null | undefined
): string =>
  `I want a plan for a report that is concise and focused. <Report topic> The topic of the report is: ${topic} </Report topic> <Report organization> The report should follow this organization: ${report_organization} </Report organization> <Context> Here is context to use to plan the sections of the report: ${context} </Context> <Task> Generate a list of sections for the report. Your plan should be tight and focused with NO overlapping sections or unnecessary filler. For example, a good report structure might look like: 1/ intro 2/ overview of topic A 3/ overview of topic B 4/ comparison between A and B 5/ conclusion Each section should have the fields: - Name - Name for this section of the report. - Description - Brief overview of the main topics covered in this section. - Research - Whether to perform web research for this section of the report. IMPORTANT: Main body sections (not intro/conclusion) MUST have Research=True. A report must have AT LEAST 2-3 sections with Research=True to be useful. - Content - The content of the section, which you will leave blank for now. Integration guidelines: - Include examples and implementation details within main topic sections, not as separate sections - Ensure each section has a distinct purpose with no content overlap - Combine related concepts rather than separating them - CRITICAL: Every section MUST be directly relevant to the main topic - Avoid tangential or loosely related sections that don't directly address the core topic Before submitting, review your structure to ensure it has no redundant sections and follows a logical flow. </Task> ${feedback ? `<Feedback> Here is feedback on the report structure from review (if any): ${feedback} </Feedback>` : ""} <Format> Call the Sections tool </Format> `;

// Corresponds to query_writer_instructions
export const getQueryWriterInstructions = (
  topic: string,
  section_topic: string,
  number_of_queries: number
): string =>
  `You are an expert technical writer crafting targeted web search queries that will gather comprehensive information for writing a technical report section. <Report topic> ${topic} </Report topic> <Section topic> ${section_topic} </Section topic> <Task> Your goal is to generate ${number_of_queries} search queries that will help gather comprehensive information above the section topic. The queries should: 1. Be related to the topic 2. Examine different aspects of the topic Make the queries specific enough to find high-quality, relevant sources. </Task> <Format> Call the Queries tool </Format> `;

// Corresponds to section_writer_instructions (the general guidelines part)
export const sectionWriterInstructions = `Write one section of a research report. <Task> 1. Review the report topic, section name, and section topic carefully. 2. If present, review any existing section content. 3. Then, look at the provided Source material. 4. Decide the sources that you will use it to write a report section. 5. Write the report section and list your sources. </Task> <Writing Guidelines> - If existing section content is not populated, write from scratch - If existing section content is populated, synthesize it with the source material - Strict 150-200 word limit - Use simple, clear language - Use short paragraphs (2-3 sentences max) - Use ## for section title (Markdown format) </Writing Guidelines> <Citation Rules> - Assign each unique URL a single citation number in your text - End with ### Sources that lists each source with corresponding numbers - IMPORTANT: Number sources sequentially without gaps (1,2,3,4...) in the final list regardless of which sources you choose - Example format: \[1\] Source Title: URL \[2\] Source Title: URL </Citation Rules> <Final Check> 1. Verify that EVERY claim is grounded in the provided Source material 2. Confirm each URL appears ONLY ONCE in the Source list 3. Verify that sources are numbered sequentially (1,2,3...) without any gaps </Final Check> `;

// Corresponds to section_writer_inputs (the dynamic input part for the section writer)
export const getSectionWriterInputs = (
  topic: string,
  section_name: string,
  section_topic: string,
  section_content: string | null | undefined,
  context: string
): string =>
  `<Report topic> ${topic} </Report topic> <Section name> ${section_name} </Section name> <Section topic> ${section_topic} </Section topic> ${section_content ? `<Existing section content (if populated)> ${section_content} </Existing section content>` : ""} <Source material> ${context} </Source material> `;

// Corresponds to section_grader_instructions
export const getSectionGraderInstructions = (
  topic: string,
  section_topic: string,
  section_content: string,
  number_of_follow_up_queries: number
): string =>
  `Review a report section relative to the specified topic: <Report topic> ${topic} </Report topic> <section topic> ${section_topic} </section topic> <section content> ${section_content} </section content> <task> Evaluate whether the section content adequately addresses the section topic. If the section content does not adequately address the section topic, generate ${number_of_follow_up_queries} follow-up search queries to gather missing information. </task> <format> Call the Feedback tool and output with the following schema: grade: Literal\["pass","fail"\] = Field( description="Evaluation result indicating whether the response meets requirements ('pass') or needs revision ('fail')." ) follow_up_queries: List\[SearchQuery\] = Field( description="List of follow-up search queries.", ) </format> `;

// Corresponds to final_section_writer_instructions
export const getFinalSectionWriterInstructions = (
  topic: string,
  section_name: string,
  section_topic: string,
  context: string
): string =>
  `You are an expert technical writer crafting a section that synthesizes information from the rest of the report. <Report topic> ${topic} </Report topic> <Section name> ${section_name} </Section name> <Section topic> ${section_topic} </Section topic> <Available report content> ${context} </Available report content> <Task> 1. Section-Specific Approach: For Introduction: - Use # for report title (Markdown format) - 50-100 word limit - Write in simple and clear language - Focus on the core motivation for the report in 1-2 paragraphs - Use a clear narrative arc to introduce the report - Include NO structural elements (no lists or tables) - No sources section needed For Conclusion/Summary: - Use ## for section title (Markdown format) - 100-150 word limit - For comparative reports: \* Must include a focused comparison table using Markdown table syntax \* Table should distill insights from the report \* Keep table entries clear and concise - For non-comparative reports: \* Only use ONE structural element IF it helps distill the points made in the report: \* Either a focused table comparing items present in the report (using Markdown table syntax) \* Or a short list using proper Markdown list syntax: - Use \`\*\` or \`-\` for unordered lists - Use \`1.\` for ordered lists - Ensure proper indentation and spacing - End with specific next steps or implications - No sources section needed 3. Writing Approach: - Use concrete details over general statements - Make every word count - Focus on your single most important point </Task> <Quality Checks> - For introduction: 50-100 word limit, # for report title, no structural elements, no sources section - For conclusion: 100-150 word limit, ## for section title, only ONE structural element at most, no sources section - Markdown format - Do not include word count or any preamble in your response </Quality Checks> `;

// Corresponds to SUPERVISOR_INSTRUCTIONS (partial, as it's very long)
export const getSupervisorInstructions = (topic: string): string =>
  `You are scoping research for a report based on a user-provided topic: ${topic}. ### Your responsibilities: 1. \*\*Gather Background Information\*\* Based upon the user's topic, use the \`enhanced\_tavily\_search\` to collect relevant information about the topic. - You MUST perform ONLY ONE search to gather comprehensive context - Create a highly targeted search query that will yield the most valuable information - Take time to analyze and synthesize the search results before proceeding - Do not proceed to the next step until you have a solid understanding of the topic. ... (rest of the supervisor prompt can be added here or broken down further) `;

// TODO: Add other prompts from prompts.py as needed, such as those for the multi-agent setup if that's also being ported.
