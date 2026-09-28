---
title: 数据、训练与推理
---

# 04｜数据、训练与推理：模型怎样学会跟随 Proxy？

CWM 包含两类学习/计算：一边用代码与 Agent 维护世界，另一边训练视频模型，让它学会按 proxy 和文本生成视觉结果。本页聚焦后者的数据闭环，并区分论文报告和公开仓库当前能跑的部分。

## 训练样本：一对同步的“草图视频 + 真实视频”

每个训练片段由三种材料组成：

```text
外观参考图 / 锚点（可选或依实现提供）
+ 结构化文本（人物、场景、动作等语义）
+ Proxy video（逐帧空间/时间条件）
─────────────────────────────
→ 目标 RGB 视频（监督目标）
```

同一时间戳必须配对：proxy 第 30 帧描述的人物位置，目标 RGB 第 30 帧就应该显示对应人物在那里。

### 游戏视频如何建样本？

游戏里能读取运行时状态，因此可同步记录目标 RGB 与相机、角色、物体等状态，然后用代码生成粗 proxy。论文写明保留用于构造 proxy 的状态，而不是直接把生产级完整模型、材质全部给模型。对每个实体可以保持实例身份，并生成逐像素实例对应关系。

### 真实视频如何建样本？

普通实拍视频一般没有游戏引擎那样的完整状态接口。论文提供 KITTI-360 的几何辅助 proof-of-concept：利用标定相机位姿、语义 3D 重建和物体标注，离线投影/编译 depth、法线和粗实体 proxy，再与同时间的 RGB 对齐。论文强调这些重建/标注只用于离线构造条件，不直接作为视频模型输入。

**不要误解为**“真实世界 proxy 完全无需标注或几何”。它是不需要单独给视频标动作标签/相机标签的一种条件设计；proxy 本身仍需要可靠的数据构造过程。

## 论文报告的训练规模与配置

按论文 §4.1：

| 项目 | 论文报告 |
|---|---|
| 基础视频模型 | MiniMax H3 Ref2VA |
| 游戏源数据 | 157 段 gameplay，约 5.6 小时 |
| 训练片段 | 9,420 个约 5 秒片段 |
| 目标视频 | 124 帧，1344×768，24 FPS |
| Proxy | 124 帧，336×192；深度 + 语义 ID |
| 多模态编码时取样 | 每 12 帧取一次，共 11 个 proxy 时间点 |
| 适配 | Rank-128 LoRA，覆盖 50 个 transformer block；约 596M 可训练参数 |
| 训练硬件 | 8× NVIDIA H800；BF16、FlashAttention-3、梯度检查点 |
| 训练步数 | 3 epochs / 3,534 optimizer steps |
| 损失与优化 | 视频目标；论文称关闭 audio loss；AdamW，global batch size 8 |

这些是论文作者报告的设置，不是我们独立复跑所得。论文的生成视频结果主要是**定性**展示，规模也受计算资源限制。

## 推理为什么分窗口？

一个 124 帧窗口按 24 FPS 大约是 5.17 秒。更长序列使用重叠窗口：

```text
窗口 1：帧 0 ───────────────── 帧 123
窗口 2：                         帧 90 ───────────────── 帧 213
                                  <重叠 34 帧>
```

每个新窗口从前一窗口的尾部 34 帧取得视觉续接上下文，同时继续提供同一外观锚点与对应的 proxy 条件。生成后拼接时保留第一窗全部帧；后续窗丢弃重复生成的前 34 帧，追加剩余 90 帧。

所以总帧数为：

```text
124 + 90 × (窗口数 − 1)
```

这是**滑窗续接**，不是无限记忆，也不是自回归实时互动的证明。重叠有助于局部接续；外观锚点有助于跨窗身份/风格稳定，但长时间漂移仍可能发生。

## 推理工程还有哪些细节？

公开仓库 README 的 Quick Start 是：

```bash
# 获取公开示例、LoRA、模型文件并把压缩条件展开
./scripts/install_release_assets.sh "$PWD/release"
cd release
CONFIG=examples/example_01/config.json

# 检查路径与配置（不加载权重、不生成视频）
python -m cwm_h3_inference validate --config "$CONFIG"

# 预先编码 anchor / proxy / Qwen 等缓存
CUDA_VISIBLE_DEVICES=0 python -m cwm_h3_inference prepare --config "$CONFIG"

# 按窗口生成、续接、拼接 MP4 与 JSON receipt
CUDA_VISIBLE_DEVICES=0 python -m cwm_h3_inference generate --config "$CONFIG"
```

仓库的 `prepare` 会编码锚点、DUV（depth + semantic ID）参考及 Qwen 文本/视觉条件；`generate` 加载 H3 与 LoRA，逐窗口采样、保存恢复文件、拼接输出。配置/缓存契约会校验参数一致性，避免拿旧缓存冒充新实验。

## 复现时最重要的纪律

如果改了模型、LoRA、锚点、条件输入、prompt、起始帧或 seed：

1. 使用新的、为空的 `cache_dir` 和新输出路径；
2. 重新执行 `prepare`；
3. 记录代码版本、模型与 LoRA revision、输入哈希、参数和 seed；
4. 不要并行写入同一缓存/输出目录；
5. 先跑 `validate`，不要把它误当成 GPU 生成成功。

公开的 40 个 Hugging Face 条件示例不是输出视频，也不是已经算好的模型缓存；安装脚本会确定性展开 NPZ 输入并建立可运行配置。基础模型/LoRA需另行下载。仓库只在**单张 H800 80GB**配置上测试过，因此普通消费级显卡未必跑得动。

## 关键科研问题

训练的数据配对、推理时的世界状态与条件构造都会影响模型。实验时至少分开记录：

- proxy 自身是否与 RGB 对齐、语义是否准确；
- 视频模型是否服从 proxy 的人物位置/轨迹/镜头；
- 画质与时间连贯性是否变化；
- 长窗口续接后身份、场景、因果状态是否保持；
- 计算成本、延迟与显存。

**本页依据：** 论文 §3.3、§4.1–4.2；仓库 [`ENVIRONMENT.md`](https://github.com/buaacyw/code-world-model/blob/main/ENVIRONMENT.md) 与 [`INFERENCE.md`](https://github.com/buaacyw/code-world-model/blob/main/INFERENCE.md)。

[下一章：公开仓库目录和复现步骤详解](/cwm/05-repo-reproduction)
