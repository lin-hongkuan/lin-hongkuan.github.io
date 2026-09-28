# Code World Model 中文学习手册｜官方来源与代码导读

> 基于论文和官方代码仓库整理的通俗科研入门网站。主要读者是第一次接触 CWM、Agent 与世界模型的本科生。事实以本页链接到的原始资料为准；论文结论和作者报告不等于独立复现。

## 首页
- [CWM 学习手册首页](https://blog.linhk.top/cwm/)

## 七章学习路线
1. [3 分钟看懂 CWM](https://blog.linhk.top/cwm/01-intuition)
2. [系统结构图解：状态如何变成视频](https://blog.linhk.top/cwm/02-architecture)
3. [Proxy：从程序状态到逐帧控制](https://blog.linhk.top/cwm/03-proxy)
4. [数据、训练与推理](https://blog.linhk.top/cwm/04-data-training)
5. [公开仓库结构与复现流程](https://blog.linhk.top/cwm/05-repo-reproduction)
6. [批判性阅读：主张、证据与限制](https://blog.linhk.top/cwm/06-critique)
7. [从论文走向本科科研](https://blog.linhk.top/cwm/07-research-roadmap)

## 原始资料
- 官方项目页：https://buaacyw.github.io/cwm/
- 论文/arXiv：https://arxiv.org/abs/2608.25927
- 论文 PDF：https://arxiv.org/pdf/2608.25927
- 官方仓库：https://github.com/buaacyw/code-world-model
- 仓库 README：https://github.com/buaacyw/code-world-model/blob/main/README.md
- [ENVIRONMENT.md](https://github.com/buaacyw/code-world-model/blob/main/ENVIRONMENT.md)
- [INFERENCE.md](https://github.com/buaacyw/code-world-model/blob/main/INFERENCE.md)

## 范围说明
该网站准确区分了论文提出的整体框架和 GitHub 当前公开的推理代码。官方仓库明确说明，用于构建 gameplay proxy 的游戏代码基础闭源、proxy 生成工具未发布；因此手册不把该仓库描述成完整训练/Agent 全栈复现包，也不宣称在当前低算力环境已实际跑通视频生成。
