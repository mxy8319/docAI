[TOC]

## 一 AI learing

> how AI like GPTs can be used to train our brains to learn subjects for more effectively

```text
## 使用英文!

一 mindMap

// knowleage mindMap （技术推荐： https://roadmap.sh/）
Hi, I want to learn “XXX”.  Please guide me as an education specialist to effectively learn this skill.

Please deconstruct the skill to make a detailed list of latest "syllabus"/"roadmap", and build a knowledge mindMap.

Furthermore, please elaborate on:
- Emerging trends and future directions in "the skill".
- Relevant and latest technologies, tools, or platforms used in this field.
thank U!


二 education

// 1 选取mindMap根节点
Now you are an education specialist. “XXX” as the theme content for teaching and explaining

// 2 关键节点：conception 概念
What is the concept of XXX, what dose it mean.How it works.Please give me some examples in layman's terms.

// 3 关键节点：connection 连接
what "XXX" knowledge nodes are associated with it? parent node?Sub-Nodes?

// 4 核心问题：变化/Common Pitfalls
What variant of the classical problem am I running into and with what solution.
For this section：Typical mistakes or misconceptions to watch out for.


=> flashCard:(核心问题)
please，Make some spaced repetition flashcards for this section. Format as Q&A.


=> visual
“Generate a flowchart/diagram for how a XXX works.”

Please use XXX as your theme for the above learning. Create a personalized  Memory Palace (also known as the Method of Loci)


=> source
Finally, could you suggest some high-quality learning resources (e.g., online courses, books, communities) that align with the prioritized core knowledge and the learning path you've outlined?"


三 practice：记录于github

// 练习题(递增难度练习)
In response to the above learning.please, Generate step-by-step problem walkthroughs and Create specific tasks or mini-projects for hands-on practice to solidify my understanding and develop proficiency. Use non-downloadable Markdown format.please make sure: Chunk difficulty ≈ 85 % success rate。If possible, suggest the expected outcome or key considerations for the tasks/mini-projects.

- A few practice questions that directly test my comprehension of the concepts.
- At least one step-by-step problem walkthrough demonstrating how to apply the concepts to solve a typical problem.
- One or more specific tasks or mini-projects that will allow me to apply the learned concepts in a more hands-on and integrated way.


// thinking 引导式思考
for this question please give me the right guidance, and hints for thinking. Never tell me the answer.


// Correction: 纠正
What is Best practice?



四 review
In order to test what I have learned above, carry out: Feynman Learning Method and Socratic Method (Prompting Critical Thinking). 苏格拉底
You will be asked to ask/question and I will answer as the teacher. A question and answer format.



## good prompt

// 尽可能的展开AI的能力
Please consider the following questions to the fullest extent of your reasoning, abstraction, and leaps of thought, without relying on human understanding or common sense

What dose this error message mean and how do I fix it.

Please explain this code ，how does this code work.
```

#### thinking：

1 AI 会受上下文的干扰。未必是最优解。可：重启新的窗口。

## 二 AI开发流程

### 第一层：定义层 => /project-docs 三个文件： product-brief.md; build-spec.md; tasks.md

#### 1 product-brief.md（产品简报）

> 其中在： ## My project idea / raw input 输入你的构思

```
You are an elite product manager and technical planning assistant.

Your task is to help me generate a concise but high-quality `product-brief.md` for an AI-assisted software project.

This is NOT a long traditional PRD.
This document must be short, practical, implementation-oriented, and directly useful for design, task breakdown, and AI coding tools such as Cursor.

Your goal is to transform my rough idea into a clear Product Brief that covers:
- requirement clarification
- MVP boundary
- user flow
- risk identification
- acceptance criteria

## Instructions

Please do the following:

1. First, infer and clarify the product idea from my input.
2. Identify ambiguity, missing assumptions, and hidden constraints.
3. Resolve reasonable assumptions when possible instead of blocking on questions.
4. Keep the output concise, structured, and action-oriented.
5. Focus on MVP thinking:
   - what must be included
   - what should be excluded for now
6. Emphasize practical delivery rather than vision statements.
7. Avoid bloated PRD language, empty slogans, and repetitive explanations.
8. Write as if this document will be used immediately by:
   - designers
   - engineers
   - AI coding assistants
9. Output in clean Markdown.
10. The final output file name should conceptually be: `product-brief.md`

## Required Output Structure

Please generate the document using exactly the following sections:

# Product Brief

## 1. Product Overview
- What the product is
- Who it is for
- What core problem it solves
- Why this product should exist now

## 2. Goals
- Primary goal
- Secondary goals
- Success metrics / measurable outcomes

## 3. Target Users
- Primary users
- Key user characteristics
- Core usage scenarios

## 4. Problem Statement
- Current pain points
- Existing alternatives
- Why current solutions are insufficient

## 5. MVP Scope
### In Scope
- Must-have features for MVP

### Out of Scope
- Explicitly excluded features
- Future ideas that should NOT be built now

## 6. User Flow
Describe the end-to-end flow of the primary user journey in numbered steps.
Include:
- entry point
- main actions
- decision points
- completion state

## 7. Functional Requirements
List the concrete functional requirements for MVP.
Each requirement should be implementation-relevant and testable.

## 8. Non-Functional Expectations
Include only relevant items such as:
- performance
- reliability
- usability
- responsiveness
- security/privacy
- maintainability

## 9. Risks and Open Questions
Identify:
- product risks
- technical risks
- UX risks
- dependency risks
- unclear assumptions that may affect scope

## 10. Acceptance Criteria
Provide clear MVP acceptance criteria.
Use bullet points.
Each criterion must be observable and verifiable.

## Writing Style Requirements
- Be concise but complete
- Prefer bullets over long paragraphs
- Avoid generic business jargon
- Avoid over-designing
- Avoid inventing unnecessary enterprise complexity
- Make reasonable assumptions explicit
- Optimize for execution

## My project idea / raw input
<PASTE MY IDEA HERE>
```

#### 2 build-spec.md （技术规范文件）

> 在最后放入：product-brief.md

```
Please act as a good architect to design a good technology stack, design algorithms, define database structure, and give colour scheme and UI design suggestions based on PRD documents.

Ensure that all aspects of my Software Development Life Cycle (SDLC) Devops such as development, testing, deployment, monitoring and maintenance are efficient, automated and secure.（Technical Design Document :TDD）

You are a senior software architect and implementation planning assistant.

Your task is to generate a concise but high-quality technical specification file called `build-spec.md`.

This document is not a vague architecture essay.
It must be practical, implementation-oriented, and directly useful for:
- engineers
- technical reviewers
- AI coding tools such as Cursor
- task breakdown and execution planning

The input to this task is a previously created `product-brief.md`.
Your job is to translate that product brief into a technical build specification for the MVP.

## Main objective

Create a `build-spec.md` that clearly defines how the MVP should be built.

It should provide enough technical structure to guide implementation, while avoiding unnecessary enterprise complexity or speculative over-design.

## What this document must achieve

The build spec should help the team answer:

- What are we building technically?
- What are the major system parts?
- What is the recommended stack?
- What data entities do we need?
- What APIs or contracts are required?
- How should state and data flow work?
- What constraints, trade-offs, and risks matter?
- What should engineers implement first?

## Rules

1. Be concise, structured, and implementation-focused.
2. Use the `product-brief.md` as the source of truth.
3. Stay within MVP scope.
4. Do not introduce major features that are outside the brief.
5. Make reasonable technical assumptions when necessary, but state them clearly.
6. Prefer practical architecture over idealized architecture.
7. Do not over-engineer for scale unless the brief clearly requires it.
8. Avoid generic statements like “use best practices” unless you define what they mean concretely.
9. Optimize for buildability, maintainability, and development speed.
10. Write in clean Markdown.

## Output format

Return only the final Markdown document.

Use exactly this structure:

# Build Spec

## 1. Technical Summary
- Brief summary of the MVP from a technical perspective
- Main technical goals
- Key implementation assumptions

## 2. Recommended Tech Stack
Specify the recommended stack for MVP, including:
- frontend
- backend
- database
- authentication
- storage
- deployment
- third-party services
- AI/model integration if relevant

For each major choice, briefly explain why it fits the MVP.

## 3. System Scope
Describe the technical scope of the MVP:
- what systems/modules are required
- what systems/modules are intentionally excluded for now

## 4. High-Level Architecture
Describe the main architecture in a practical way.
Include:
- client
- server
- database
- external services
- major integration points

Use bullets or simple diagrams in Markdown text form if helpful.

## 5. Core Modules
List the major implementation modules.
For each module, include:
- purpose
- responsibilities
- important inputs/outputs
- dependencies

Examples:
- auth
- user profile
- chat/session
- billing
- admin
- analytics
- content management
- notifications

Only include modules actually relevant to the MVP.

## 6. Data Model
Define the core data entities required for MVP.
For each entity, include:
- entity name
- purpose
- important fields
- relationships to other entities

Keep this lightweight but specific enough for implementation.

## 7. API / Interface Contracts
Describe the main contracts required for MVP.
This may include:
- frontend-backend API endpoints
- request/response expectations
- external webhook interfaces
- model input/output structure
- internal service boundaries if needed

For each contract, include:
- purpose
- method / interaction type
- main input fields
- main output fields
- error cases if important

Focus on the most important contracts only.

## 8. State and Data Flow
Explain how key data should move through the system.
Include:
- client state
- server state
- async operations
- loading/error/empty handling
- caching or persistence if relevant

Keep this practical and tied to the MVP experience.

## 9. Security and Permission Considerations
Include only what is relevant to MVP, such as:
- authentication approach
- authorization rules
- session handling
- secret management
- input validation
- privacy concerns
- abuse prevention if relevant

Do not invent enterprise-grade controls unless clearly needed.

## 10. Non-Functional Technical Expectations
Define only practical expectations relevant to MVP, such as:
- performance targets
- reliability expectations
- responsiveness
- accessibility baseline
- observability/logging
- maintainability
- testing baseline

Use concrete and actionable wording.

## 11. Delivery Risks and Trade-Offs
Identify the most relevant technical risks, including:
- implementation complexity
- external dependency risk
- unclear contracts
- scaling assumptions
- UX/latency trade-offs
- speed vs maintainability trade-offs

For each risk, briefly note the likely mitigation.

## 12. Suggested Build Order
Provide a recommended implementation order for the MVP.
Use a numbered list.
The order should reflect dependency flow and fast validation.

## 13. Open Questions
List remaining technical questions that should be resolved before or during implementation.

## Writing style requirements
- Be concise but complete
- Prefer bullets over long paragraphs
- Stay grounded in MVP delivery
- Avoid generic architecture jargon
- Avoid over-design
- Make assumptions explicit
- Optimize for execution and implementation clarity

## Additional constraints for AI coding workflow
This document will be used downstream by AI-assisted coding tools.

So please ensure:
- architecture is concrete enough to guide implementation
- module boundaries are practical
- data model is usable
- contracts are implementation-relevant
- suggested build order is realistic
- risks are specific and actionable
- avoid vague statements that cannot be translated into engineering tasks

## Strict quality bar

The output must be useful enough that an engineer could start implementation immediately after reading it.

That means:
- module definitions must be actionable
- entities must be concrete
- interfaces must be plausible
- build order must be dependency-aware
- risks must reflect real implementation concerns

Do not write this like a presentation document.
Write it like a lightweight technical spec for an actual MVP build.

## Input: product-brief.md
<PASTE PRODUCT BRIEF HERE>
```

#### 3 tasks.md （开发整体流程/步骤）

```
You are a senior engineering manager and implementation planning assistant.

Your task is to generate a practical execution planning document called `execution-backlog.md`.

This document is not a roadmap presentation.
It is not a vague to-do list.
It must be a concrete, implementation-ready backlog that helps engineers and AI coding tools execute the MVP step by step.

The input to this task is a previously created `build-spec.md`.
Your job is to transform that technical specification into a structured execution backlog.

## Main objective

Create an execution backlog that converts the MVP technical plan into a realistic implementation sequence.

The document must include:
- milestones
- ordered task list
- acceptance criteria for each step
- commit granularity suggestions

This document should be directly usable for:
- planning implementation
- feeding one task at a time into AI coding tools such as Cursor
- tracking progress
- reducing implementation ambiguity
- keeping commits small, reviewable, and reversible

## Rules

1. Use `build-spec.md` as the source of truth.
2. Stay strictly within MVP scope.
3. Break work into small, practical, dependency-aware tasks.
4. Do not create giant implementation steps.
5. Each task must be clear enough that it can be executed in one focused work session when possible.
6. Order tasks in a way that reduces blockers and allows early validation.
7. Include acceptance criteria for every task.
8. Include a suggested commit strategy for every task or sub-task.
9. Prefer implementation realism over theoretical completeness.
10. Avoid vague tasks such as “build frontend” or “implement backend”.
11. If assumptions are needed, make them explicit.
12. Write in clean Markdown.
13. Optimize for actual execution, not presentation.

## Output format

Return only the final Markdown document.

Use exactly this structure:

# Execution Backlog

## 1. Execution Strategy
Briefly explain:
- the implementation approach
- the dependency logic
- how the work is staged
- what should be validated early

## 2. Milestones
Provide a short list of implementation milestones for the MVP.

For each milestone, include:
- milestone name
- milestone goal
- what is considered complete

## 3. Task Breakdown by Milestone

For each milestone, use the following structure:

### Milestone X: [Name]

**Goal**
- What this milestone is meant to achieve

**Tasks**

For each task, use this exact format:

#### Task X.Y: [Task name]

**Purpose**
- Why this task exists

**Scope**
- What should be implemented in this task
- What should not be included in this task

**Suggested implementation notes**
- Relevant files, modules, contracts, or dependencies
- Any important sequencing notes
- Any assumptions that should be kept in mind

**Acceptance criteria**
- Observable and testable completion conditions
- Use bullet points
- These must be specific enough for engineering verification

**Suggested commit granularity**
Provide 1 to 3 suggested commits for this task.
For each commit, include:
- commit purpose
- what should be included in that commit

**Dependencies**
- What must already exist before this task starts
- If none, say “None”

**Risks / failure modes**
- What could go wrong
- What to watch for during implementation

## 4. Cross-Cutting Checks
List implementation checks that should be applied throughout execution, such as:
- type safety
- linting
- test coverage
- loading/error/empty state handling
- auth/permission checks
- responsiveness
- logging
- accessibility baseline
- config/env validation

Only include checks relevant to the MVP.

## 5. Definition of Done for MVP
Provide a concise MVP-level definition of done.

This should include:
- feature completeness expectations
- quality baseline
- validation baseline
- deployment readiness baseline

## 6. Recommended Working Pattern for AI Coding
Because this backlog may be used with AI coding tools, provide a short recommended working pattern for execution.

Include guidance such as:
- implement one task at a time
- do not merge multiple tasks into one generation step
- validate after each task
- keep commits small
- review generated code before moving on

Keep this section concise and practical.

## Writing style requirements
- Be concise but complete
- Prefer bullets over long paragraphs
- Make every task actionable
- Make acceptance criteria concrete
- Keep milestone scope realistic
- Avoid management jargon
- Avoid vague backlog items
- Optimize for execution speed, implementation clarity, and reviewability

## Additional constraints for AI coding workflow
This backlog will be used downstream by AI-assisted coding tools.

So please ensure:
- tasks are small enough to be executed incrementally
- acceptance criteria are explicit
- task order reflects real dependencies
- commit suggestions are practical and review-friendly
- tasks do not hide multiple unrelated goals inside one item
- the backlog supports iterative development and rollback if needed

## Strict quality bar

The output must be detailed enough that an engineer or AI coding assistant can start implementation immediately, one task at a time.

That means:
- milestones must reflect real delivery phases
- tasks must be dependency-aware
- acceptance criteria must be testable
- commit suggestions must be practical
- no task should contain multiple major features unless they are tightly coupled
- no milestone should be so broad that progress becomes hard to validate

Do not write this like a project management summary.
Write it like an execution plan for an actual MVP build.

## Input: build-spec.md
<PASTE BUILD SPEC HERE>
```

### 第二层：UI层 Figma Make => /ui-docs

> 视觉方向确认 + 设计系统落点确认 + 实现成本预判。做“视觉方向确认”。

#### 1 Figma Make 的输入得到：产品图确定

1 Product Brief 摘要

2 Build Spec 摘要

3 UI 输入包

- 3 个参考产品图
- 希望的气质词

#### 2 Prompt 1：用于生成方向与关键页面

```
You are helping me define the UI direction for a web-based MVP.

I do NOT want final production code.
I want visual direction exploration, key screen concepts, and an implementation-friendly design basis.

Use the following project context:

[Product Summary]
<insert concise summary from product-brief.md>

[Technical UI Constraints]
<insert concise summary from build-spec.md>

[Relevant Current Tasks]
<insert only the UI-relevant tasks from tasks.md>

[References]
<attach 2–4 reference images and explain what to borrow from each>

Your job:
1. Generate 3 distinct UI directions for this MVP.
2. For each direction, show the following key screens:
   - Home / dashboard
   - Core workflow page
   - Result / detail page
3. Keep the design implementation-friendly for React + Tailwind + shadcn/ui.
4. Avoid over-designed visuals, complex custom illustrations, or heavy glassmorphism.
5. Focus on:
   - visual hierarchy
   - information clarity
   - reusable components
   - realistic spacing
   - scalable typography
   - consistent card / form / button / tab patterns

For each direction, optimize around one of these themes:
A. Safe and clean SaaS
B. Premium modern
C. Dense productivity

Important constraints:
- Web-first
- MVP only
- Prioritize usability and structure over visual decoration
- Should support future design-token extraction
- Should be easy to translate into reusable UI components

Please generate the directions in a way that makes them easy to compare and iterate.
```

#### 2 用于收敛为可交接 UI 基线

```
Use the selected UI direction as the baseline.

Now refine it into an implementation-ready UI foundation for an MVP web app.

Focus on these deliverables inside the design:
1. A consistent visual direction across key screens
2. Reusable component patterns
3. Clear spacing and typography rhythm
4. A design-token-friendly structure
5. States for key interactions

Please refine the selected direction with these requirements:

Design system foundation:
- Define a scalable color structure
- Use a consistent spacing rhythm
- Use a clear typography hierarchy
- Keep radius, borders, and shadows systematic
- Keep all visual choices easy to map to design tokens

Component baseline:
- Button: primary / secondary / ghost / destructive
- Input: default / focus / error / disabled
- Card: default / elevated / interactive
- Tabs / badge / dialog / table patterns where relevant

Screen refinement:
- Home / dashboard
- Core workflow page
- Result / detail page

Interaction states to represent where relevant:
- empty
- loading
- error
- completed / success

Constraints:
- Keep it implementation-friendly for React + Tailwind + shadcn/ui
- Avoid one-off visual flourishes that cannot scale
- Prioritize reusable patterns over page-specific decoration
- Prepare this work for design inspection and developer handoff
```

#### 3 用 Figma 截图/总结作为输入，再让 ChatGPT 生成四个文档

1. ui-direction.md

解决的是：
“我们选哪套视觉方向，为什么选它？”

它应该短，偏决策。

2. design-tokens.md

解决的是：
“颜色、间距、圆角、字体这些基础规则是什么？”

它应该结构化，偏系统。

3. component-mapping.md

解决的是：
“Figma 里的组件，开发里怎么映射到 shadcn/ui / React 组件？”

它应该偏工程翻译。

4. ui-handoff.md

解决的是：
“当前要交给 Cursor 的页面、状态、约束、验收是什么？”

它应该偏执行交接。

### 第三层：开发层 Cursor

#### 1 相关配置文件：.cursorrules 以及为 Cursor 创建： 单任务执行提示词（Prompt）。

```
## 输入
one task from task.md

relevant build spec section

relevant UI handoff section

target files and acceptance criteria
```

#### 2 通用prompt

```
You are implementing exactly one scoped engineering task in an existing codebase.

Your goal is to complete only the task described below.
Do not expand scope.
Do not refactor unrelated parts of the codebase.
Do not introduce extra features, architectural changes, or speculative abstractions unless they are required by the task.

## Execution rules

Follow these rules strictly:

1. Implement only the current task.
2. Touch only the files listed in "Target files", unless a very small supporting change is absolutely necessary.
3. Preserve the existing architecture, naming style, and code patterns unless the task explicitly requires a change.
4. Reuse existing components, utilities, hooks, types, and patterns wherever possible.
5. Keep the implementation simple, readable, and consistent with the current project.
6. Do not add placeholder logic, fake data, or TODO-heavy scaffolding unless explicitly requested.
7. Do not perform broad cleanup or unrelated optimizations.
8. Do not rewrite existing modules unless necessary for this task.
9. When UI is involved, follow the UI handoff closely, but prioritize reusable implementation over pixel-level decoration.
10. If a detail is unspecified, choose the most conservative implementation consistent with the provided spec.

## Task context

### Current task
<PASTE ONE TASK FROM tasks.md HERE>

### Relevant build spec
<PASTE RELEVANT BUILD SPEC SECTION HERE>

### Relevant UI handoff
<PASTE RELEVANT UI HANDOFF SECTION HERE>

### Target files
<LIST TARGET FILES HERE>

### Acceptance criteria
<PASTE ACCEPTANCE CRITERIA HERE>

## Implementation instructions

Please do the following:

- Read the current task carefully and implement only what is required.
- Use the build spec as the technical source of truth.
- Use the UI handoff as the source of truth for layout, component usage, states, and constraints.
- Limit changes to the target files whenever possible.
- Prefer extending existing project patterns over introducing new ones.
- If a small supporting type/helper/component is required, keep it minimal and aligned with the existing codebase.

## Output format

When finished, provide:

1. A short summary of what was implemented
2. A concise list of files changed
3. Any important assumption made during implementation
```

### 第四层：审核层

#### 通用prompt

```
You are reviewing the implementation of exactly one scoped task in an existing codebase.

Validate the generated code using a strict 3-pass review process.

Use the existing conversation context as the source of truth.

Review in this order:

Pass 1 — Static Check
- TS types
- import paths
- unused variables/imports/functions
- ESLint / format risks
- dead code / unreachable code

Pass 2 — Business Check
- API endpoint correctness
- parameter mapping
- loading / error / empty states
- permission branches
- form validation
- edge cases
- acceptance criteria coverage

Pass 3 — Architecture Check
- directory/layer violations
- duplicate logic / missed reuse
- page logic inside components
- unnecessary state
- testability

Rules:
- Review only the current task
- Do not expand into future tasks
- Do not suggest unrelated refactors
- Keep the three passes clearly separated
- Distinguish blocking vs non-blocking issues

Output format:

# 3-Pass Review Result

## Pass 1 — Static Check
### Assessment
### Blocking issues
### Non-blocking issues
### Summary

## Pass 2 — Business Check
### Assessment
### Blocking issues
### Non-blocking issues
### Acceptance criteria coverage
### Summary

## Pass 3 — Architecture Check
### Assessment
### Blocking issues
### Non-blocking issues
### Scope and structure notes
### Summary

## Final Verdict
- Ready / Ready after minor fixes / Not ready
- short conclusion
- next fixes in priority order
```
