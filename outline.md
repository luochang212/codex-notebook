# 《Codex 的设计取舍：一个 Rust Coding Agent 的架构解剖》

修订日期：2026-07-21

## 定位

不是源码导读，而是**设计取舍的解剖**。

每一章回答一个设计问题，源码只在"为什么这样做"时出场。读者读完应该能回答：
- Codex 做了哪些关键设计决策？
- 每个决策放弃了什么、得到了什么？
- 如果我要做类似系统，哪些可以直接借鉴，哪些需要根据场景变通？

面向读者：有工程经验、想理解 coding agent 系统设计的开发者。

---

## 全书主线

不按模块展开，而是沿着一条设计张力线：

> **如何在沙箱安全约束下，让 LLM 拥有尽可能大的代码修改自主权？**

Codex 的回答是一套"受控自主"架构：Session 管理生命周期 → 上下文工程决定模型看到什么 → 工具系统决定模型能做什么 → 沙箱和 Guardian 决定边界在哪 → 多 agent 把自主权分治。这条线贯穿全书。

---

## 序章

### 0. 这本书在讲什么

- Codex 不是一个 LLM 包装器，而是一个**受控执行运行时**
- 和 Claude Code、Cursor、Aider 的本质区别：它是一个沙箱优先的 agent runtime
- 全书阅读方法：看决策、看边界、看取舍
- 版本基线：`openai/codex` @ `841e47b8fb`

---

## 第一篇：循环引擎

> 核心问题：一次用户输入到最终响应，经历了什么？

### 1. Session 与 Turn：谁拥有生命周期

- 设计问题：一个 coding agent 的"一次对话"应该由谁管理？
- Session 拥有什么：config、conversation history、input queue、agent status
- Turn 的边界：从 user input 到 terminal event（Completed/Errored/Interrupted）
- 为什么 Session 和 Turn 必须分开：一个 Session 可以有多个 Turn，Turn 之间共享上下文
- **取舍**：Session 是有状态的重量级对象，换来的是跨 turn 的上下文连续性和持久化能力

配源码：`session/session.rs` 的 Session 结构体、`session/turn.rs` 的 turn 生命周期

### 2. 模型调用：流式响应与错误编码

- 设计问题：LLM 调用失败了怎么办？重试？降级？还是把错误交给模型自己处理？
- Responses API 的流式事件模型
- 错误不是异常——错误被编码进事件流
- 重试策略：`responses_retry.rs` 的退避逻辑
- model fallback：compaction 时主模型失败切备用模型
- **取舍**：流式设计让每个消费者都要写状态机，但它让中断恢复、部分响应成为可能

配源码：`client.rs` 的 stream 调用、`responses_retry.rs` 的重试策略

### 3. 工具执行循环：turn 里真正干活的部分

- 设计问题：模型说"我要执行一个命令"，系统应该怎么响应？
- 工具调用的完整链路：spec 注册 → 模型输出 tool_call → handler 执行 → 结果回注
- 并行 vs 串行工具调用
- 工具执行不是插件调用——它是 turn 循环的一部分
- **取舍**：工具是 turn 循环的内嵌环节而非外挂，牺牲了灵活性，换来了执行顺序的确定性

配源码：`tools/handlers/mod.rs` 的调度逻辑、`session/turn.rs` 的循环结构

---

## 第二篇：上下文工程

> 核心问题：模型看到什么，决定了它能做什么。如何构造"刚好够用"的上下文？

### 4. 上下文构造：一次 query 后模型看到了什么

- 设计问题：system prompt 不是一个字符串，而是一套装配流程
- 装配顺序：base instructions → AGENTS.md → skills → environment context → world state
- 每一层的来源和优先级
- 为什么 environment context 每步都重建
- **取舍**：动态装配让 prompt 难以预测最终形态，但让系统能适应任何项目

配源码：`session/step_context.rs`、`context/` 目录下的各注入模块

### 5. 缓存与压缩：把无限对话装进有限窗口

- 设计问题：用户和 agent 聊了 200 轮，context window 装不下了
- prompt cache 的命中条件：前缀不变才能命中
- compaction 的触发时机和策略：token budget 超限 → 摘要压缩
- 压缩时保留什么、丢弃什么
- **取舍**：自动压缩是有损的，但"丢失细节"好过"context overflow 导致请求失败"

配源码：`compact.rs`、`compact_token_budget.rs`、`session/context_window.rs`

### 6. WorldState 与增量记录：不是每步都全量注入

- 设计问题：环境信息（git status、子 agent 列表、时间）每步都变，怎么高效记录？
- baseline/diff 机制：首次全量，后续只记变化
- WorldState 的组成：git info、subagent list、time reminder、hook context
- 为什么不用每步全量：token 浪费 + 破坏 prompt cache 前缀
- **取舍**：增量记录增加了实现复杂度，但保护了缓存命中率和 token 预算

配源码：`context_manager/history.rs` 的 baseline/diff、`session/world_state.rs`

---

## 第三篇：工具与执行

> 核心问题：给 LLM 什么样的工具接口，才能让它犯最少的错、造成最小的破坏？

### 7. 工具系统：结构化的行动接口

- 设计问题：为什么不给 LLM 一个万能 bash 就够了？
- 工具注册：spec（schema + description）→ handler（执行逻辑）
- 核心工具：apply_patch、shell、read、write、web_search
- 工具 spec 如何影响模型行为：description 是写给模型看的"使用手册"
- **取舍**：结构化工具限制了模型的表达方式，但大幅降低了破坏性操作的概率

配源码：`tools/handlers/apply_patch.rs`、`function_tool.rs`

### 8. 执行策略与沙箱：自由的边界在哪

- 设计问题：模型要执行 `rm -rf /`，系统怎么阻止？
- 三层防线：exec policy（命令级）→ sandbox（进程级）→ 文件系统隔离（OS 级）
- Linux：bubblewrap + landlock
- macOS：seatbelt (sandbox-exec)
- Windows：独立的 windows-sandbox
- 网络策略：默认禁止，白名单放行
- **取舍**：沙箱限制了模型能做的事（不能装包、不能访问网络），但让"全自动执行"成为可能

配源码：`sandboxing/` crate、`exec_policy.rs`、`unified_exec/`

---

## 第四篇：安全与审批

> 核心问题：沙箱之外的操作（写文件、网络请求）如何获得授权？

### 9. Guardian：不是所有"能做的"都该做

- 设计问题：沙箱管不了的事（比如"这个 patch 该不该 apply"）谁来管？
- Guardian 的角色：在工具执行前做审批判断
- approval request 的生命周期：请求 → 用户确认/拒绝 → 继续/中止
- 自动审批 vs 人工审批的边界
- **取舍**：审批增加了交互延迟，但让"半自动"模式成为可能——用户保持最终控制权

配源码：`guardian/mod.rs`、`guardian/approval_request.rs`、`tools/approvals.rs`

---

## 第五篇：多 Agent

> 核心问题：一个 agent 忙不过来时，如何安全地分治？

### 10. 角色与 Spawn：子 agent 是怎么来的

- 设计问题：为什么需要多种"角色"而不是统一的一种 agent？
- 角色的本质：写给父 agent 看的使用说明，不是子 agent 的行为约束
- spawn 的两种模式：空白新建 vs fork 父上下文
- V1 vs V2 协议的核心区别
- **取舍**：角色系统极其轻量（加一个角色只需一段 description），但无法强制执行行为边界

配源码：`agent/role.rs`、`agent/control/spawn.rs`

### 11. 通信与回收：子 agent 的结果怎么回来，垃圾怎么清理

- 设计问题：子 agent 干完活了，父 agent 怎么知道？
- V1：completion watcher 被动注入
- V2：Session 自身在 terminal turn 主动转发
- 清理机制：显式 close、V2 LRU 驱逐、注册表释放
- 注入内容无独立过期，依赖 compaction 统一处理
- **取舍**：不做精细的"通知过期"，依赖已有 compaction 机制——简单但粗糙

配源码：`session/mod.rs:1801`、`agent/control/residency.rs`、`agent/control/legacy.rs`

---

## 第六篇：扩展与配置

> 核心问题：哪些能力内建，哪些外置？用户如何定制行为？

### 12. Skill：用文档替代代码的扩展方式

- 设计问题：为什么 skill 是 markdown 文件而不是插件代码？
- skill 的发现、选择、注入流程
- skill 没有运行时能力，但它零依赖、人类可审计
- **取舍**：skill 不能调 API、不能改行为，但它让"教 agent 做事"变成了"写文档"

配源码：`skills.rs`、`codex-rs/skills/`

### 13. MCP 与插件：外部工具的标准化接入

- 设计问题：如何让第三方工具安全地接入 agent？
- MCP 协议的适配：tool spec 转换、权限映射
- 插件系统：core-plugins 的注册和生命周期
- **取舍**：MCP 增加了工具调用的间接层，但让工具生态可以独立于 agent 演进

配源码：`mcp.rs`、`mcp_tool_call.rs`、`plugins/`

### 14. 配置层与 AGENTS.md：行为如何被定制

- 设计问题：全局默认、项目规则、目录级指令，如何合并？
- 配置优先级：CLI flag > 项目 config > 全局 config > 默认值
- AGENTS.md 的发现和拼接
- permission profile：预定义的权限组合
- **取舍**：多层配置增加了心智负担，但让"全局默认 + 项目定制"成为可能

配源码：`config/mod.rs`、`agents_md.rs`、`config/permissions.rs`

---

## 第七篇：设计哲学

> 核心问题：这些决策背后有什么统一的思想？

### 15. 受控自主：这套架构的取舍总结

- 内核只做三件事：管生命周期、构造上下文、执行工具
- 安全不是事后加的——沙箱是执行的前提条件
- 与 Claude Code、Cursor、Aider 的设计对比
- 这套架构适合什么、不适合什么
- 如果要二次开发，优先改哪里

---

## 依赖关系

```
ch00-prologue
ch01-session-turn ═══> ch02-model-call ═══> ch03-tool-loop ═══> ch04-context ═══> ch05-compaction ═══> ch06-worldstate
                                                                        │
                                                                        ├──> ch07-tools ═══> ch08-sandbox ═══> ch09-guardian
                                                                        │
                                                                        ├──> ch10-roles ═══> ch11-communication
                                                                        │
                                                                        ├──> ch12-skills
                                                                        ├──> ch13-mcp
                                                                        └──> ch14-config
                                                                                    │
                                                                                    └──> ch15-philosophy
```

**关键路径**: ch01 → ch02 → ch03 → ch04 → ch05 → ch06 → ch07 → ch08 → ch09 → ch15

## 写作规则

1. **每章以设计问题开头** — 不是"这个模块有什么"，而是"为什么要这样设计"
2. **每个关键决策标注取舍** — 得到什么、放弃什么
3. **源码只在需要时出场** — 代码块不超过 40 行，只展示设计核心
4. **中文写作，术语保留英文** — 如 session, turn, tool call, compaction, sandbox
5. **每章 3000-6000 字** — 不超过 8000 字
6. **图示使用 Mermaid** — 放在章节内，纵向布局优先
7. **章节文件命名** — `website/docs/qa/ch{NN}-{slug}.mdx`
8. **源码引用格式** — `codex-rs/core/src/session/turn.rs`（不写本机绝对路径）
9. **每章底部一行源码快照** — 记录核对的 commit hash

## 建议写作顺序

1. **ch01-ch03**（循环引擎）— 全书技术核心，先写最难的
2. **ch04-ch06**（上下文工程）— 循环引擎的燃料
3. **ch07-ch09**（工具与安全）— 自主权的边界
4. **ch10-ch11**（多 agent）— 自主权的分治
5. **ch12-ch14**（扩展与配置）— 用户如何定制
6. **ch15**（设计哲学）— 最后升华
7. **ch00**（序章）— 全书写完后回头写
