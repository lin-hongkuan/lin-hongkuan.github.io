---
title: Code World Model 学习手册
layout: page
---

# Code World Model 中文学习手册

> 把论文讲成人话，把代码讲清楚，把研究路线落到能验证的实验。

这是为第一次接触世界模型、Agent 和视频生成的本科生写的一套阅读课。跟着七章从直觉、架构、proxy、数据训练、代码复现一路学到科研选题；每章都标出来源与事实边界。

**推荐起点：** [先用 3 分钟看懂 CWM →](/cwm/01-intuition)

## 七章路线

| 章节 | 你会学到什么 | 推荐耗时 |
|---|---|---:|
| [01 直觉入门](/cwm/01-intuition) | CWM 为什么把“世界变化”和“画面生成”分开 | 10 分钟 |
| [02 系统架构](/cwm/02-architecture) | Agent、状态、代码、Proxy、视频模型怎样连接 | 20 分钟 |
| [03 Proxy](/cwm/03-proxy) | 为什么逐帧空间条件比纯文字更可控 | 20 分钟 |
| [04 数据与训练](/cwm/04-data-training) | 训练数据怎么配、H3 怎样微调、长视频怎样续窗 | 20 分钟 |
| [05 仓库与复现](/cwm/05-repo-reproduction) | GitHub 代码目录、运行流程、硬件与复现边界 | 25 分钟 |
| [06 批判性阅读](/cwm/06-critique) | 哪些证据支持了主张，哪些仍未证明 | 20 分钟 |
| [07 科研路线](/cwm/07-research-roadmap) | 怎样从想法变成可评测的本科项目 | 30 分钟 |

## 一张图理解

```text
玩家/用户提出意图
        ↓
Coding Agent：理解事件，需要时写/改规则
        ↓
可执行代码维护世界状态：实体、位置、关系、历史
        ↓
Proxy 编译器：把当前相关状态变成简化逐帧视频
        ↓
视频模型：生成有外观细节的 RGB 观测
        ↓
观测/反馈进入下一轮
```

**核心分工：** 代码主要决定“发生什么、结果怎样持续”；视频模型主要决定“它看起来怎样”。Proxy 是二者间可检查的时空接口。

## 你应该先知道的边界

论文提出完整的 CWM 框架；但当前公开 GitHub 仓库主要发布 MiniMax H3 Ref2VA + CWM LoRA 的推理组件、输入格式和示例。作者说明，构造 gameplay proxy 所依赖的闭源游戏代码基础与工具未发布。因此它**不是完整的一键论文复现包**，手册也不会把未公开的部分说成已经可复现。

- 论文：`Code World Model: Coding Agent as World Brain`，arXiv `2608.25927v1`。
- 论文报告：在约 5.6 小时游戏视频数据上微调；训练使用 8 张 H800，公开推理测试使用单张 H800 80GB。
- 论文承认：原型规模有限、尚无自回归实时生成，Agent 仍难以从零可靠实现复杂游戏机制。
- 结果以定性视频展示为主，不能单凭示例宣称已证明通用因果模拟、物理正确或可直接训练机器人。

<div class="cwm-links">
<a href="https://buaacyw.github.io/cwm/">原始项目页 ↗</a>
<a href="https://arxiv.org/abs/2608.25927">论文 / arXiv ↗</a>
<a href="https://github.com/buaacyw/code-world-model">官方代码仓库 ↗</a>
</div>

## 学习完成后，你应该能回答

1. 为什么单靠视频模型的视觉历史难以维护长时状态？
2. Agent、普通代码和视频模型分别负责什么？
3. Proxy 为什么既不是文字提示，也不是最终画面或完整 3D？
4. 公开仓库能复现哪部分，不能复现哪部分？
5. 若做一个低算力科研项目，怎样定义任务、基线和指标？

如果这五题都能讲清楚，你就不只是“看过一段 demo”，而是能开始和导师认真讨论这个方向。

<style>
.cwm-links{display:flex;flex-wrap:wrap;gap:12px;margin:24px 0}.cwm-links a{padding:12px 16px;border-radius:10px;border:1px solid var(--vp-c-divider);background:var(--vp-c-bg-soft);text-decoration:none;font-weight:650}.cwm-links a:hover{border-color:var(--vp-c-brand-1);color:var(--vp-c-brand-1)}
</style>
